# Sprint 4 Report (4/5/24 - 5/4/24)

## What's New (User Facing)

 * Adjust Randomized Box Locations
 * Swap Direction of Vectors
 * Create Stability Stimuli Test
 * Determine angle of error
 * Convert screen width from pixel to dpi
 * Change target practice to stability test error bounds
 * Split calibration script into multiple scripts
 * Remove Pages
 * Make error sequence into a button
 * Hide webcam on tests
 * Fix the error sequence size

## Work Summary (Developer Facing)

Basically, we focused on fixing issues and improving the functions implemented before. For the fixing part, we fixed issues that the vector shows different directions in the error sequence, showing the randomized boxes out of the display, and the error sequences were showed out of display. For the improvement parts, the application shows the actual distance (inch) when the user uses the error sequence tests and the stability test.

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