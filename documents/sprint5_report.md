# Sprint 5 Report (8/19/24 - 9/13/24)

## What's New (User Facing)

 * Made Target Practice Hit Box Timer Based
 * Implemented stability method
 * Add a function that display missed targets in target practice test
 * Update target update borders and missed targets

## Work Summary (Developer Facing)

In this sprint, we mainly worked on updating functions and fixing bugs. We updated the target practice function by increasing border size to spread targets close to each screen border, displaying blue dots for each missed target after the cycle, and changing target practice to time-based. Also, we implemented a stability method to reduce crosshair shake as an experiment. We also fixed the bug with static calibration that had too many calibration points, not stretching the points to fit the screen size, and calibration didn't record the coordination correctly. In addition, we started to work on implementing head-tracking to increase the precision of eye-tracking.

## Unfinished Work
We finished all tasks as we planned. However, we began implementing head-tracking earlier than scheduled (Sprint 6), and it is not yet finished.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/88
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/79
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/81
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/77
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/pull/82
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/78
 
 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/87

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [calibration.tsx](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/pages/calibration.tsx)
 * [src/components](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/tree/Yuuki_Sprint4_Report/src/components)

## Demo
Sprint 5 Demo: https://youtu.be/EbQqNYJXt4Q
 
## Retrospective Summary
Here's what went well:
  * Completed all tasks in the sprint
  * Communicated frequently with the team via Discord and meetings
 
Here's what we'd like to improve:
   * More clarity on who does which tasks
  
Here are changes we plan to implement in the next sprint:
   * Implement a stable cursor that can remain in one of the 4x4 grids on the screen reliably
   * Implement head position that will work for eye tracking
   * Work towards the distortion matrix to fix issues of eye tracking not hitting edges of the screen