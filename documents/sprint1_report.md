# Sprint 1 Report (01/08/2024 - 02/04/2024)

## What's New (User Facing)

* Implemented a React-Electron base desktop application
* Implemented the base face and iris tracking

## Work Summary (Developer Facing)
In our recent sprint, our team learned how to utilize TypeScript, React, Electron, and Mediapipe, enabling us to develop a basic desktop application capable of tracking faces and irises through a webcam. To enhance efficiency, we divided the project into two main components: the frontend which built a React-Electron application, and the backend, which focused on implementing the face tracking feature. We encountered a challenge during the merging phase due to the frontend was primarily written in TypeScript, while the backend was developed in JavaScript. However, we successfully resolved this issue by deepening our understanding of the difference between TypeScript and JavaScript.

## Unfinished Work
We finished all work in this sprint.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

* https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/1
* https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/3
* https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/4
* https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/5
* https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/6
* https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/7

 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 
 * N/A

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [src/index.tsx](https://github.com/your_repo/file_extension)

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