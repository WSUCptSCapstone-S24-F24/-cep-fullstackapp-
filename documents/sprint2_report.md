# Sprint 2 Report (02/05/2024 - 03/03/2024)

## What's New (User Facing)

* Implemented left-iris and right-iris tracking windows
* Researched the methods for eye-tracking
* Implemented the basic calibration method
* Implemented a linear regression eye-tracking

## Work Summary (Developer Facing)
This sprint we updated our application by creating zoomed in windows which tracks each of our iris'. This is not in use at the moment, but we may plan to track the coordinates via the zoomed in videos instead of our main webcam view.

We researched some algorithms to use for eye tracking with just a webcam. We put our finding in our Research_report document. We have created a basic eye prediction software which uses linear regression. This works by allowing the user to click anywhere on the screen to generate a red dot. When a dot is placed, we record the average of the two iris' x and y position via the webcam and the x and y position on the screen where the dot is placed. This will save where our eyes are looking and where on the screen it occurred. Linear regression will take these points and make linear line to best fit these points. It will predict where on the screen we are looking based on our current iris positions. The barriers that come with this is that our predicted point works in realtime but is very shaky and will need a noise filter to reduce how much it moves. The prediction point is not very accurate and at best can correctly get to each quadrant of the screen.

Currently, our calibration system is inputted manually therefor results vary as well as the fact that this does not include any head tilt compensation. If you move your head too much, it will result in poorer predictions.

## Unfinished Work
We planned to create different pages in our application which includes a blank calibration screen, targeting screen and results screen. We also did not complete the implemented calibration screen and noise filtering on our eye tracking cursor. These were not completed as we ran out time time because we switched around issues in the middle of this sprint. We had to remove some other issues as this sprint because our plans shifted once we found an eye tracking method and we were able to test and further see what issues we have now.


## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

* [Create camera windows for better tracking](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/8)
* [Find eye-tracking methods](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/10)
* [Create Research Report eye-tracking Method](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/15)
* [Linear Regression Algorithm Implementation](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/18)

 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 
* [Apply a noise filter on eye tracking](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/21)
* [Create Seperate Pages in the Application](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/17)
* [Create Basic Calibration Screen](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/16)
* [Implement testing statistics](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/11)
* [Create virtual boxes on each side of the screen](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/9)

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [/src/index.tsx](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/index.tsx)
 * [Reserch_report]()

## Demo
Sprint 2 Demo: https://www.youtube.com/watch?v=kkrvUrU15MQ
 
## Retrospective Summary
Here's what went well:
  * Implemented an eye-tracking in the applicaiton
  * Understand the eye-tracking methods
 
Here's what we'd like to improve:
* Improve prediction via updating more consistent calibration
* Improve accuracy by applying a noise filter and a vector filter

Here are changes we plan to implement in the next sprint:
   * A noise filter for an eye-tracking
   * Multiple pages for the application
     * Calibration page
     * Target page (accuracy testing)
     * Full result page
   * Checking accuracy
