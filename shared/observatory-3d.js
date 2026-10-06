(function(){
  const canvas = document.getElementById("observatory3d");
  if(!canvas) return;

  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let device_scale = 1;
  let simulation_time = 0;
  let previous_frame_time = performance.now();

  let nodes_paused = false;
  let camera_locked = false;
  let camera_mode = "orbit";

  let experiment_running = false;
  let experiment_tick = 0;
  let experiment_elapsed = 0;
  let pulse_fired = false;
  let shock_level = 0;

  const parameters = {
    coupling: 0.58,
    perturbation: 0.18,
    coherence: 0.70,
    damping: 0.42,
    speed: 1.00
  };

  let seed = 251404606 >>> 0;
  function random_number(){
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const colors = ["#2df3ff","#9b62ff","#ff5cbe","#ffdc72","#75ffaa"];
  const nodes = [];
  const links = [];
  const pulses = [];

  function create_node(index){
    const angle = (index / 18) * Math.PI * 2;
    const layer = (index % 3) - 1;
    const radius = 250 + (index % 5) * 42;
    return {
      id: index,
      x: Math.cos(angle) * radius + (random_number() - 0.5) * 90,
      y: layer * 110 + Math.sin(index * 1.7) * 48,
      z: Math.sin(angle) * radius + (random_number() - 0.5) * 90,
      radius: 12 + random_number() * 7,
      color: colors[index % colors.length],
      phase: random_number() * Math.PI * 2,
      drift: random_number() * Math.PI * 2,
      vx: (random_number() - 0.5) * 8,
      vy: (random_number() - 0.5) * 8,
      vz: (random_number() - 0.5) * 8,
      excitation: 0,
      local_phase: random_number() * Math.PI * 2
    };
  }

  for(let index = 0; index < 18; index += 1){
    nodes.push(create_node(index));
  }

  function rebuild_links(){
    links.length = 0;
    for(let i = 0; i < nodes.length; i += 1){
      for(let j = i + 1; j < nodes.length; j += 1){
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const distance = Math.hypot(dx, dy, dz);
        if(distance < 330 || (i % 6 === j % 6 && distance < 520)){
          links.push([i, j, distance]);
        }
      }
    }
  }
  rebuild_links();

  for(let index = 0; index < 28; index += 1){
    pulses.push({
      link: null,
      p: 0,
      speed: 0.10 + random_number() * 0.15,
      color: colors[Math.floor(random_number() * colors.length)],
      active: false
    });
  }

  function resize_canvas(){
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    device_scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * device_scale;
    canvas.height = height * device_scale;
    context.setTransform(device_scale, 0, 0, device_scale, 0, 0);
  }
  window.addEventListener("resize", resize_canvas, { passive: true });
  resize_canvas();

  function hex_to_rgb_string(hex_value){
    const clean = hex_value.replace("#", "");
    const number = parseInt(clean, 16);
    return `${(number >> 16) & 255},${(number >> 8) & 255},${number & 255}`;
  }

  function rotate_y(point, angle){
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return { x: point.x * cosine - point.z * sine, y: point.y, z: point.x * sine + point.z * cosine };
  }

  function rotate_x(point, angle){
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return { x: point.x, y: point.y * cosine - point.z * sine, z: point.y * sine + point.z * cosine };
  }

  function project(point){
    const camera_distance = 760;
    const z = point.z + 900;
    const scale = camera_distance / Math.max(150, z);
    return {
      x: width / 2 + point.x * scale,
      y: height / 2 + point.y * scale,
      z: point.z,
      s: scale,
      alpha: Math.max(0.12, Math.min(1, (point.z + 650) / 1050))
    };
  }

  function transform_point(point){
    const yaw = camera_locked ? 0 : (camera_mode === "inspect" ? Math.sin(simulation_time * 0.18) * 0.22 : simulation_time * 0.08);
    const pitch = camera_locked ? -0.18 : (-0.22 + Math.sin(simulation_time * 0.07) * 0.07);
    return project(rotate_x(rotate_y(point, yaw), pitch));
  }

  function set_text(id, value){
    const element = document.getElementById(id);
    if(element){ element.textContent = value; }
  }

  function sync_controls_to_display(){
    const mappings = [
      ["coupling", "couplingOut", value => value.toFixed(2)],
      ["perturbation", "perturbationOut", value => value.toFixed(2)],
      ["coherence", "coherenceOut", value => value.toFixed(2)],
      ["damping", "dampingOut", value => value.toFixed(2)],
      ["speed", "speedOut", value => value.toFixed(2) + "×"]
    ];
    mappings.forEach(function(mapping){
      const slider = document.getElementById(mapping[0]);
      const output = document.getElementById(mapping[1]);
      if(slider && output){
        parameters[mapping[0]] = Number(slider.value);
        output.textContent = mapping[2](parameters[mapping[0]]);
      }
    });
  }

  document.querySelectorAll('input[type="range"]').forEach(function(input){
    input.addEventListener("input", function(){
      sync_controls_to_display();
      shock_level = Math.max(shock_level, 0.22);
    });
  });
  sync_controls_to_display();

  document.querySelectorAll("[data-mode]").forEach(function(button){
    button.addEventListener("click", function(){
      document.querySelectorAll("[data-mode]").forEach(function(other_button){
        other_button.classList.remove("active");
      });
      button.classList.add("active");
      camera_mode = button.dataset.mode;
    });
  });

  const pause_nodes_button = document.getElementById("pauseNodes");
  if(pause_nodes_button){
    pause_nodes_button.addEventListener("click", function(){
      nodes_paused = !nodes_paused;
      pause_nodes_button.textContent = nodes_paused ? "Resume Nodes" : "Pause Nodes";
    });
  }

  const lock_camera_button = document.getElementById("lockCamera");
  if(lock_camera_button){
    lock_camera_button.addEventListener("click", function(){
      camera_locked = !camera_locked;
      lock_camera_button.classList.toggle("active", camera_locked);
      lock_camera_button.textContent = camera_locked ? "Unlock Camera" : "Lock Camera";
      set_text("cameraModeReadout", camera_locked ? "Locked world view" : "Orbiting world space");
    });
  }

  const reset_button = document.getElementById("resetDemo");
  if(reset_button){
    reset_button.addEventListener("click", reset_demo);
  }

  const run_button = document.getElementById("runExperiment");
  if(run_button){
    run_button.addEventListener("click", run_sample_experiment);
  }

  function reset_demo(){
    experiment_running = false;
    experiment_tick = 0;
    experiment_elapsed = 0;
    pulse_fired = false;
    shock_level = 0;
    nodes.forEach(function(node, index){
      node.excitation = 0;
      node.vx *= 0.15;
      node.vy *= 0.15;
      node.vz *= 0.15;
      node.local_phase = (index * 1.618) % (Math.PI * 2);
    });
    pulses.forEach(function(pulse){
      pulse.active = false;
    });
    set_text("experimentStatus", "Ready");
    set_text("experimentNote", "Baseline drift first. A selective perturbation fires at Tick 50.");
    update_experiment_ui();
  }

  function run_sample_experiment(){
    reset_demo();
    experiment_running = true;
    experiment_tick = 0;
    experiment_elapsed = 0;
    pulse_fired = false;
    set_text("experimentStatus", "Running");
    set_text("experimentNote", "Baseline drift first. A selective perturbation fires at Tick 50.");
    update_experiment_ui();
  }

  function fire_pulse(){
    pulse_fired = true;
    shock_level = 1;
    const source_node = nodes[1];
    source_node.excitation = 1;
    source_node.vx += 55;
    source_node.vy -= 18;
    source_node.vz += 28;
    for(let index = 0; index < 8; index += 1){
      const pulse = pulses[index];
      pulse.active = true;
      pulse.p = 0;
      pulse.link = links[(index * 5 + 3) % links.length];
      pulse.color = index % 2 ? "#2df3ff" : "#ff5cbe";
    }
  }

  function update_experiment_ui(){
    set_text("demoTick", String(experiment_tick));
    const progress_bar = document.getElementById("experimentProgress");
    if(progress_bar){
      progress_bar.style.width = Math.min(100, (experiment_tick / 150) * 100) + "%";
    }
    document.querySelectorAll(".tick").forEach(function(element){
      const tick_value = Number(element.dataset.tick);
      element.classList.toggle("active", experiment_tick >= tick_value);
    });
    set_text("pulseState", pulse_fired ? "Fired" : "Waiting");
    if(!experiment_running && experiment_tick >= 150){
      set_text("experimentStatus", "Complete");
    }
  }

  function step_physics(delta_time){
    const dt = Math.min(delta_time, 0.035) * parameters.speed;
    const perturbation = parameters.perturbation;
    const damping = Math.max(0.02, parameters.damping);
    const coherence = parameters.coherence;
    const coupling = parameters.coupling;

    nodes.forEach(function(node, index){
      const environmental_x = Math.sin(simulation_time * 0.63 + node.drift) * perturbation * 9;
      const environmental_y = Math.cos(simulation_time * 0.47 + node.phase) * perturbation * 7;
      const environmental_z = Math.sin(simulation_time * 0.31 + index * 0.8) * perturbation * 8;
      node.vx += environmental_x * dt;
      node.vy += environmental_y * dt;
      node.vz += environmental_z * dt;
      node.local_phase += (0.28 + (1 - coherence) * 0.42 + node.excitation * 0.16) * dt;
      node.excitation *= Math.pow(1 - damping * 0.12, dt * 60);
    });

    links.forEach(function(link){
      const i = link[0];
      const j = link[1];
      const node_a = nodes[i];
      const node_b = nodes[j];
      const dx = node_b.x - node_a.x;
      const dy = node_b.y - node_a.y;
      const dz = node_b.z - node_a.z;
      const distance = Math.max(1, Math.hypot(dx, dy, dz));
      const preferred_distance = 245;
      const spring = (distance - preferred_distance) / preferred_distance;
      const phase_similarity = (Math.cos(node_a.local_phase - node_b.local_phase) + 1) / 2;
      const effective_coupling = coupling * (0.35 + 0.65 * phase_similarity);
      const force = spring * effective_coupling * 8;
      const ux = dx / distance;
      const uy = dy / distance;
      const uz = dz / distance;

      node_a.vx += ux * force * dt;
      node_a.vy += uy * force * dt;
      node_a.vz += uz * force * dt;
      node_b.vx -= ux * force * dt;
      node_b.vy -= uy * force * dt;
      node_b.vz -= uz * force * dt;

      const transfer = (node_a.excitation - node_b.excitation) * effective_coupling * 0.020;
      node_a.excitation -= transfer;
      node_b.excitation += transfer;
    });

    nodes.forEach(function(node){
      const drag = Math.pow(1 - Math.min(0.85, damping * 0.045), dt * 60);
      node.vx *= drag;
      node.vy *= drag;
      node.vz *= drag;
      node.x += node.vx * dt * 9;
      node.y += node.vy * dt * 9;
      node.z += node.vz * dt * 9;

      const radius = Math.hypot(node.x, node.y, node.z);
      if(radius > 520){
        const pull = (radius - 520) * 0.003;
        node.vx -= node.x * pull;
        node.vy -= node.y * pull;
        node.vz -= node.z * pull;
      }
    });

    shock_level *= Math.pow(0.92, dt * 60);
  }

  function draw_grid(){
    for(let z = -520; z <= 520; z += 80){
      const a = transform_point({x:-560, y:260, z:z});
      const b = transform_point({x:560, y:260, z:z});
      context.strokeStyle = "rgba(45,243,255,.07)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
    for(let x = -560; x <= 560; x += 80){
      const a = transform_point({x:x, y:260, z:-520});
      const b = transform_point({x:x, y:260, z:520});
      context.strokeStyle = "rgba(155,98,255,.06)";
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
  }

  function draw_bounding_cube(){
    const cube_points = [
      {x:-420,y:-240,z:-420},{x:420,y:-240,z:-420},{x:420,y:240,z:-420},{x:-420,y:240,z:-420},
      {x:-420,y:-240,z:420},{x:420,y:-240,z:420},{x:420,y:240,z:420},{x:-420,y:240,z:420}
    ].map(transform_point);

    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];

    context.strokeStyle = "rgba(147,202,223,.20)";
    context.lineWidth = 1;
    edges.forEach(function(edge){
      const a = cube_points[edge[0]];
      const b = cube_points[edge[1]];
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    });
  }

  function draw_arc(point_a, point_b, color, alpha, width_value){
    const midpoint_x = (point_a.x + point_b.x) / 2;
    const midpoint_y = (point_a.y + point_b.y) / 2 - Math.min(55, Math.abs(point_a.x - point_b.x) * 0.06);
    context.strokeStyle = `rgba(${hex_to_rgb_string(color)},${alpha})`;
    context.lineWidth = width_value;
    context.beginPath();
    context.moveTo(point_a.x, point_a.y);
    context.quadraticCurveTo(midpoint_x, midpoint_y, point_b.x, point_b.y);
    context.stroke();
  }

  function draw_node(node, projected){
    const color_rgb = hex_to_rgb_string(node.color);
    const core = Math.max(3, node.radius * projected.s * (1 + node.excitation * 0.28));

    context.save();
    context.globalAlpha = 0.25 + 0.72 * projected.alpha;

    let gradient = context.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, core * (3.5 + node.excitation * 2.0));
    gradient.addColorStop(0, `rgba(${color_rgb},${0.38 + node.excitation * 0.30})`);
    gradient.addColorStop(0.36, `rgba(${color_rgb},.12)`);
    gradient.addColorStop(1, `rgba(${color_rgb},0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(projected.x, projected.y, core * (3.5 + node.excitation * 2.0), 0, Math.PI * 2);
    context.fill();

    context.translate(projected.x, projected.y);
    context.strokeStyle = `rgba(232,245,248,${0.22 + 0.26 * projected.alpha})`;
    context.lineWidth = Math.max(0.7, 1.1 * projected.s);
    const tick = core * 1.55;
    context.beginPath();
    context.moveTo(-tick,0); context.lineTo(-core * 0.78,0);
    context.moveTo(core * 0.78,0); context.lineTo(tick,0);
    context.moveTo(0,-tick); context.lineTo(0,-core * 0.78);
    context.moveTo(0,core * 0.78); context.lineTo(0,tick);
    context.stroke();

    gradient = context.createRadialGradient(0,0,0,0,0,core * 1.4);
    gradient.addColorStop(0,"rgba(255,255,255,.96)");
    gradient.addColorStop(0.32,`rgba(${color_rgb},${0.86 + node.excitation * 0.08})`);
    gradient.addColorStop(1,`rgba(${color_rgb},.06)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0,0,core * 1.4,0,Math.PI * 2);
    context.fill();
    context.restore();

    const tail_end = transform_point({
      x: node.x - node.vx * 0.9,
      y: node.y - node.vy * 0.9,
      z: node.z - node.vz * 0.9
    });
    context.save();
    context.strokeStyle = `rgba(${color_rgb},${0.16 + projected.alpha * 0.25})`;
    context.lineWidth = Math.max(0.8, projected.s);
    context.beginPath();
    context.moveTo(projected.x, projected.y);
    context.lineTo(tail_end.x, tail_end.y);
    context.stroke();
    context.restore();
  }

  function update_experiment(delta_time){
    if(!experiment_running) return;
    experiment_elapsed += delta_time * parameters.speed;
    const next_tick = Math.min(150, Math.floor(experiment_elapsed * 18));
    if(next_tick !== experiment_tick){
      experiment_tick = next_tick;
      if(experiment_tick >= 50 && !pulse_fired){
        fire_pulse();
      }
      update_experiment_ui();
    }
    if(experiment_tick >= 150){
      experiment_running = false;
      set_text("experimentStatus", "Complete");
      set_text("experimentNote", "Demo complete. Change the sliders and rerun to compare how the same pulse propagates.");
    }
  }

  function draw_pulses(projected_nodes, delta_time){
    pulses.forEach(function(pulse){
      if(!pulse.active || !pulse.link) return;
      pulse.p += pulse.speed * delta_time * parameters.speed;
      if(pulse.p > 1){
        pulse.p = 0;
        if(experiment_running){
          pulse.link = links[Math.floor(random_number() * links.length)];
        }else{
          pulse.active = false;
        }
      }
      const i = pulse.link[0];
      const j = pulse.link[1];
      const point_a = projected_nodes[i].projected;
      const point_b = projected_nodes[j].projected;
      const q = pulse.p;
      const midpoint_x = (point_a.x + point_b.x) / 2;
      const midpoint_y = (point_a.y + point_b.y) / 2 - Math.min(55, Math.abs(point_a.x - point_b.x) * 0.06);
      const x = (1 - q) * (1 - q) * point_a.x + 2 * (1 - q) * q * midpoint_x + q * q * point_b.x;
      const y = (1 - q) * (1 - q) * point_a.y + 2 * (1 - q) * q * midpoint_y + q * q * point_b.y;
      const color_rgb = hex_to_rgb_string(pulse.color);
      const radius = 2.8 + 6 * ((point_a.s + point_b.s) / 2);

      const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 3.2);
      gradient.addColorStop(0, `rgba(${color_rgb},.72)`);
      gradient.addColorStop(1, `rgba(${color_rgb},0)`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius * 3.2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(255,255,255,.82)";
      context.beginPath();
      context.arc(x, y, Math.max(1.3, radius * 0.28), 0, Math.PI * 2);
      context.fill();
    });
  }

  function draw_axes(){
    const center = transform_point({x:0,y:0,z:0});
    [
      ["X","#2df3ff",{x:430,y:0,z:0}],
      ["Y","#ffdc72",{x:0,y:-310,z:0}],
      ["Z","#9b62ff",{x:0,y:0,z:430}]
    ].forEach(function(entry){
      const label = entry[0];
      const color = entry[1];
      const end_point = transform_point(entry[2]);
      context.strokeStyle = `rgba(${hex_to_rgb_string(color)},.32)`;
      context.lineWidth = 1.35;
      context.beginPath();
      context.moveTo(center.x, center.y);
      context.lineTo(end_point.x, end_point.y);
      context.stroke();
      context.fillStyle = `rgba(${hex_to_rgb_string(color)},.72)`;
      context.font = "11px ui-sans-serif,system-ui";
      context.fillText(label, end_point.x + 8, end_point.y + 4);
    });
  }

  function animation_frame(now){
    const delta_time = Math.min(0.05, ((now - previous_frame_time) / 1000) || 0.016);
    previous_frame_time = now;

    if(!nodes_paused){
      simulation_time += delta_time * parameters.speed;
      step_physics(delta_time);
      update_experiment(delta_time);
    }

    context.clearRect(0,0,width,height);
    const background_gradient = context.createRadialGradient(width * 0.50, height * 0.48, 0, width * 0.50, height * 0.48, Math.max(width, height) * 0.70);
    background_gradient.addColorStop(0, `rgba(45,243,255,${0.045 + shock_level * 0.025})`);
    background_gradient.addColorStop(0.34, "rgba(155,98,255,.028)");
    background_gradient.addColorStop(1, "rgba(2,7,17,0)");
    context.fillStyle = background_gradient;
    context.fillRect(0,0,width,height);

    draw_grid();
    draw_bounding_cube();

    const projected_nodes = nodes.map(function(node){
      return { node: node, projected: transform_point(node) };
    });

    links.forEach(function(link, index){
      const i = link[0];
      const j = link[1];
      const point_a = projected_nodes[i].projected;
      const point_b = projected_nodes[j].projected;
      const depth = (point_a.alpha + point_b.alpha) / 2;
      const color = index % 3 === 0 ? "#2df3ff" : (index % 3 === 1 ? "#9b62ff" : "#ff5cbe");
      const live = (nodes[i].excitation + nodes[j].excitation) / 2;
      draw_arc(point_a, point_b, color, 0.035 + 0.10 * depth + 0.16 * live, 0.7 + 1.0 * depth + 1.1 * live);
    });

    draw_pulses(projected_nodes, delta_time);

    projected_nodes.sort(function(a,b){ return a.projected.z - b.projected.z; });
    projected_nodes.forEach(function(entry){
      draw_node(entry.node, entry.projected);
    });

    draw_axes();

    window.requestAnimationFrame(animation_frame);
  }

  reset_demo();
  set_text("cameraModeReadout", "Orbiting world space");
  window.requestAnimationFrame(animation_frame);
})();