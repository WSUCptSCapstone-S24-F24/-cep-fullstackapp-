# Sprint 1 Report (01/08/2024 - 02/04/2024)

## What's New (User Facing)

* Implemented a React-Electron base desktop application
* Implemented the base face and iris tracking

## Work Summary (Developer Facing)
In our recent sprint, our team learned how to utilize TypeScript, React, Electron, and Mediapipe, enabling us to develop a basic desktop application capable of tracking faces and irises through a webcam. To enhance efficiency, we divided the project into two main components: the frontend which built a React-Electron application, and the backend, which focused on implementing the face tracking feature. We encountered a challenge during the merging phase due to the frontend was primarily written in TypeScript, while the backend was developed in JavaScript. However, we successfully resolved this issue by deepening our understanding of the difference between TypeScript and JavaScript. We now have a good understanding of how we can use Electron, React, and MediaPipe to progress our project.

## Unfinished Work
We finished all work in this sprint.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

 * [Create project description](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/1#issue-2097137351)
 * [Yuuki](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/pull/2)
 * [Connect mediapipe to electron](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/3)
 * [Mediapipe facemesh onto webcam](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/4#issue-2117301260)
 * [Update repo readme](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/5#issue-2117301454)
 * [Change project language from javascript to typescript](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/6#issue-2117301976)
 * [Create project requirements](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/7#issue-2117302152)

 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 
 * N/A

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [/src/index.tsx](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/index.tsx)

## Demo
Here is the link to the demo:
https://youtu.be/jjsaA6MvPJs
 
## Retrospective Summary
Here's what went well:
  * Implemented a React-Electron base desktop application
  * Implemented the base face and iris tracking
 
Here's what we'd like to improve:
* Solve the problem the application uses lots of GPU memory in the specific environment

Here are changes we plan to implement in the next sprint:
   * Create a window in the application which will be a close up and track left eye, right eye and a head view
   * Create virtual boxes on each side of the screen to be a left and right in preparation for testing out eye tracking
   * Create a subsystem which can be used to track the validity and percentages of our eye tracking in relation to hitting the virtual boxes
