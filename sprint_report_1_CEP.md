# Sprint x Report (1/16/24 - 2/4/2024)
[Demo Video](https://youtu.be/jjsaA6MvPJs)

## What's New (User Facing)
 * Electron and React apps which overlay a facemesh on top of the users' webcam video in real-time through MediaPipe

## Work Summary (Developer Facing)
In this sprint, our team learned how to create an Electron app which uses MediaPipe to perform face landmark tracking on a users' webcam in real-time. To do this, we all first made small applications in React, Electron, and typescript to get a basic understanding of how these tools work individually. Our small applications included hello world programs, Electron apps which do real-time calculations with webcam input, and React apps which display images and allow the user to increment a counter by clicking a button. After creating these, we then looked into integrating MediaPipe into Electron, which wasn't difficult once we found the relevant documentation.  We had some problems looking for relevant documentation, but overall things went smoothly. We now have a good understanding of how we can use Electron, React, and MediaPipe to progress our project.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

 * [Create project requirements](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/7#issue-2117302152)
 * [Change project language from javascript to typescript](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/6#issue-2117301976)
 * [Update repo readme](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/5#issue-2117301454)
 * [Mediapipe facemesh onto webcam](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/4#issue-2117301260)
 * [Connect mediapipe to electron](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/3)
 * [Create project description](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/1#issue-2097137351)
 
## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [Name of code file 1](https://github.com/your_repo/file_extension)
 * [Name of code file 2](https://github.com/your_repo/file_extension)
 * [Name of code file 3](https://github.com/your_repo/file_extension)
 
## Retrospective Summary
Here's what went well:
  * Booststrapping MediaPipe and Electron/React
  * Integrating MediaPipe into our Electron and React apps
 
Here's what we'd like to improve:
   * Enhancing the performance of our application
   * Improving our utilization of typescript
  
Here are changes we plan to implement in the next sprint:
   * Use iris tracking to calculate the users' point of gaze, with at least enough precision to select one block in a 3x3 grid.