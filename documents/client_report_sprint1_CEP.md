# Client Meetings Report

## Agenda (1/19)
 *Ask Jon how we should approach the project, including questions about languages and libraries used

## Minutes (1/19)
Here is a summary of what we talked about:
-This is more than a tech demo but it is more to explore and see if we can utilize eye tracking with media pipe into Cephable.
-Questions we want to answer for our outcome:
   "Can we use media pipe for eyetracking?"
   "What is the accuracy of eye tracking with mediapipe?"
-We are looking to try and spit out x,y coordinates of where we are looking at the screen. Maybe start out with yes, no buttons, but then gradually increase the amount of boxes and get better accuracy (Hopefully be able to fully type with our eyes.)
-Documentation is not a high priority to Jon (But we should try and keep a good documentation, regardless)
-He asked us our knowledge of mobile developement and we said none really, but I don't think he gave us any instructions or guidance regarding the mobile aspect so maybe we can ask about it more next thursday
-We can email him questions throughout the week (Prefers email and he will respond within 24 hours).
-Jon is an expert on machine learning and other accessibility questions
-We won't really be using machine learning by training, we will mostly be focusing on the inference which is making predictions on live data to get results. (I think I'm not too familiar with the 'Inference' terminology, but we wont be doing any training)

We were given the following tasks:
 * Create Hello world applications in Typescript, Electron, and React
 * Get a webcam to stream video in these applications
 * Create a rough schedule for the semester

## Retrospective Summary (1/19)
Here's what went well:
 * Our questions were answered
 * We were given guidance on how to progress
 
Here's what we'd like to improve:
 * Our understanding of the project
  
Here are changes we plan to implement as soon as possible:
 * Create a list of questions for our next meeting with Jon
   
## Agenda (1/26)
 * Show Jon our progress
 * Ask how to continue
 * Ask questions to get a better understanding of the project

## Minutes (1/26)
Here are the questions we asked, and Jon's responses:
What problem is our project seeking to solve?
	Determining whether or not modern mediapipe can provide reasonable eye tracking. A system that can do eye tracking and validate it’s quality.
What is the domain and context in which we are trying to solve this problem?
	Modern machines (mostly windows but doesnt really care). Avoid windows only solutions. This is a research evaluation of the current state of the art, what we can do with it, and viability of our project.
What separates our project from other state-of-the-art solutions in its field?
	Scleral eye tracking is gold standard.
	PCCR eye tracking is really good but expensive and relatively low spec. - Tobii I16, PCI mobile, PCI 5.
Who are the stakeholders for this project?
	Cephable, end users (w/ significant motor impairments), devs, support personnel who support people with impairments (could be professionals or family members). 
	Researchers use eye tracking in game development and other consumer research.
Is this project closed or open source?
	No preference, but MIT license if it is open source.
How do you want us to approach eye tracking?
	Using machine learning over trigonometry to do eye tracking. Not doing bright/dark pupil illumination.


## Retrospective Summary (1/26)
Here's what went well:
 * Our questions were answered
 * We informed Jon of our progress
 * We were given further guidance on how to progress
 
Here's what we'd like to improve:
 * Our understanding of eye tracking algorithms
  
Here are changes we plan to implement as soon as possible:
 * Create a rough schedule of the semester to present to Jon in our next meeting
   
## Agenda (1/31)
 * Show Jon our latest progress
 * Show Jon our schedule
 * Ask for input on the schedule and our next steps

## Minutes (1/31)
We showed Jon our rough schedule, and he asked us to add extra dates for planning research. 
We showed our MediaPipe demo, and breifly talked about how we could use it for eye tracking.

## Retrospective Summary (1/31)
Here's what went well:
 * We informed Jon of our progress
 * We were given further guidance on how to progress
 
Here's what we'd like to improve:
 * Our understanding of eye tracking algorithms
 * Our schedule
  
Here are changes we plan to implement as soon as possible:
 * Update our schedule
 * Update our MediaPipe app to get more detailed information about the eyes
 * Research eye tracking algorithms