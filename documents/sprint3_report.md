# Sprint 3 Report (3/4/24 - 4/4/24)

## What's New (User Facing)
 * Created Basic Calibration
 * Create Seperate Pages in the Application
 * Apply noise filter on eye tracking
 * Basic Left and Right Targeting
 * Target Practice
 * Results Functionality
 * Research gradient vector fields
 * Create Vector Graph
 * Limit Vector Field Sequence to one at a time
 * Research Weight Implementation
 * Error Calculation
 * Research Convolution
 * Revert Vector Field Scaling

## Work Summary (Developer Facing)
With our basic calibration, we created a simple target practice which initially started out as a left and right box on each side of the screen that can be highlighted when our predicted crosshair location goes within the bounds. This later turned into a target practice mini game where randomly, one at a time boxes would appear and at the end it would display the percentage of how many boxes you hit during the sequence. Apart from this, we also created an error sequence that displays dots one a time with a letter corresponding to what direction you need to press in order to move onto the next dot. At the end of this sequence we will have 16 vectors in a vector field that shows the magnitude error of the dot positions (where we are looking) and where the crosshair (where our algorithm thinks we are looking).

## Unfinished Work
Almost all of the work we did finish that we planned. Some things were removed and decided that it would not be a priority. These included things like fixing our 1 Euro filter which did not work very well, but instead we decided to remove it from our project as it was not as important yet. When switching pages, we sometimes get errors when moving from a page with our camera to without one. This is not a high priority as our project is mainly research and minor errors were irrelevant.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:

 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/16
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/17
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/21
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/26
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/33
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/34
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/40
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/42
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/44
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/46
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/47
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/50
 
 ## Incomplete Issues/User Stories
 Here are links to issues we worked on but did not complete in this sprint:
 
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/31 <This was a minor error that is very low on the priority>
 * https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/issues/30 <When implementing the 1 Euro Filter, it made our eye tracking stability worse, so it would be better to remove it until we actually have good results data.>

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
 * [virtual_box.tsx](https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/virtual_box.tsx)
 * [box_container.tsx] (https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/box_container.tsx
 * [calibration.tsx] (https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/src/pages/calibration.tsx)
 
## Document Files for Review
Please review ther following documentation files:
 * [Convolution_Research_Report.md] https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-/blob/main/documents/Convolution_Reserch_report.md

## Demo
Here is the link to the demo: https://youtu.be/WPEKK6dK-uY

## Retrospective Summary
Here's what went well:
  * Our progress feels much better than last sprint. We were able to get more issues completed.
  * Towards the end of the sprint, Dedicated Friday to Sunday with researching new topics and ideas. Monday to Wednesday with implementation.
  * Better communication with Jon via emails. Not just during the meetings.
 
Here's what we'd like to improve:
   * Communication and more brainstorming as a team.
   * Find our issues sooner rather than later during implemenation.
  
Here are changes we plan to implement in the next sprint:
   * We will dedicate the time on the weekend to research and implementation during the week since we only just started this system.
   * Start our portions sooner, so if we don't understand something, we can ask eachother sooner rather than right before the deadline.