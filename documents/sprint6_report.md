# Sprint 6 Report (9/14/24 - 10/13/24)

## What's New (User Facing)

 * Implemented Memory Game
 * Implemented Gaze Tracing
 * Implemented Head Tracking
 * Enhanced the stability for eye-tracking

## Work Summary (Developer Facing)

In this sprint, we focused on adding more functions the client asked for and improving the accuracy of eye-tracking.
The memory game function allows the user to play a simple memory game with eye-tracking. The user can select how many cards
they want to play with the game at first. After that, the user can flip cards while gazing at the card for 1.5 seconds, and if the picture of the cards matches, the cards will disappear. The gaze tracking function records where the user looks at the screen. The user can record where the user looked at by pushing the gaze tracing button and then pushing the "R" key. After a few seconds, it will show the trace of how the user looked at the screen.
The head tracking function shows where the head is located by yaw (left-right), roll (up-down), and pit(tilt). It was implemented by using OpenCV.
Also, we enhanced the stability for eye-tracking by weighted average.

## Unfinished Work
We couldn't finish adding score function for memory game, and fixing performance issue for the application that happens when we run it on Chrome.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/98
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/pull/112
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/96
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/110
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/94
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/108
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/106
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/pull/107
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/100
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/pull/105
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/99
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/97
 
 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/101
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/116

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [calibration.tsx](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/pages/calibration.tsx)
 * [src/components](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/tree/Yuuki_Sprint4_Report/src/components)

## Demo
Sprint 6 Demo: https://youtu.be/sr7AAHAD67U
 
## Retrospective Summary
Here's what went well:
  * Communicated frequently with the team via Discord and meetings
  * We finished many tasks and received great feedback from the client
  * Tried to help a team member who faced the difficulties
 
Here's what we'd like to improve:
   * Double-check schedule for the meetings
  
Here are changes we plan to implement in the next sprint:
   * Get head tilt working
   * Save method for one user which allows user to reload a calibration
   * Working distortion matrix or reliable method to hit screen edges
