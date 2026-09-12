# EL-EXP-GAMMA-004 Post-Confirmatory Diagnostic 001

Status: exploratory; performed only after the frozen N=30 verdict.

The terminal Λ reliability states were inspected across 30 seeds, 6 nodes, 6 event kinds, and 14 typed-consequence channels. These counts describe the final selector preferences; they are not the number of event-time selections.

| Event kind | Γ-preferred | Λ-preferred | Ties | Λ share |
|---|---:|---:|---:|---:|
| ALIGN_THETA | 1,418 | 676 | 426 | 26.83% |
| DISRUPT_PHASE | 1,010 | 1,088 | 422 | 43.17% |
| ERODE_MEMORY | 1,370 | 730 | 420 | 28.97% |
| INTEGRATION_PULSE | 1,308 | 783 | 429 | 31.07% |
| RECOVERY_SHOCK | 1,334 | 752 | 434 | 29.84% |
| SUPPORT_MEMORY | 1,068 | 1,026 | 426 | 40.71% |
| **Total** | **7,508** | **5,055** | **2,557** | **33.43%** |

Λ did not simply remain inert: it became preferred particularly for `DISRUPT_PHASE` and `SUPPORT_MEMORY`. Nevertheless, Γ/Λ terminal error differences were extremely small and the Tandem RMSE did not improve. The two experts supplied insufficiently complementary information for hard routing to create value.

The diagnostic supports three new questions:

1. Do Γ and Λ predict distinct residuals after removing event type and strength?
2. Does a lens require its own observation stream and timescale rather than reinterpretation of the same settled archive?
3. Should tandem coupling be residual/additive, multiplicative, or hierarchical rather than winner-take-channel routing?
