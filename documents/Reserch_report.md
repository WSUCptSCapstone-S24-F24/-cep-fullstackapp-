# Report for Eyetracking Method

## Abstract

This is a reserching report about possible eyetracking methods for MediaPipe.

## Method 1: Calibration System

This system simply implemented by the steps below:

1. **Setting Calibration Points**
   - Select Calibration Points: Choose several points on the screen that you want the user's gaze to follow.
2. **Collecting Eye Tracking Data**
   - Data Collection: While the user is looking at each calibration point, the eye tracking device records the position of the gaze. This establishes a relationship between the captured gaze data and the actual positions of the calibration points.
3. **Calibration Algorithm**
   - Determine Mapping Function: Based on the collected data, create a mapping function that predicts the user's gaze position for any given point on the screen.

## Method 2: Linear Regression

Linear regression is a statistical technique used to model the relationship between one or more independent variables and a dependent variable using a linear equation.

**Types of Linear Regression:**
- **Simple Linear Regression:** It predicts a single dependent variable (y) based on one independent variable (x). The relationship is represented by a linear equation (y = ax + b). For example, you can use simple linear regression to predict cafe sales based on the distance from the nearest train station.
- **Multiple Linear Regression**: It predicts a dependent variable (y) based on two or more independent variables (x). The relationship is still represented by a linear equation. For instance, if you want to predict cafe sales considering factors like distance, seating capacity, and visibility, you’d use multiple linear regression.
- **Calculating the Regression Line using Least Squares Method:**
The most common method for finding the regression line in linear regression is the Least Squares Method. It minimizes the sum of squared prediction errors to determine the most reliable relationship.

## Method 3: Gaze estimation by Iris Cordination

**Step 1: Identify the Position of the Iris and the Center of the Eye Using MediaPipe**

The first step is using MediaPipe to accurately locate the iris within the eye and identifies the specific coordinates of the iris and the center of the eye.

**Step 2: Determine Where the Person is Looking Based on the Iris's Position Relative to the Eye's Center**

Once the iris and the center of the eye are identified, the next step involves calculating the iris's position relative to the eye's center. By analyzing this relative position, it's possible to infer the gaze direction of the person. The assumption is that if the iris is located towards the upper part of the eye, the person is looking up, and similarly, if the iris is towards the lower part, the person is looking down.

## References

Online eye tracking: Webcam eye-tracking software. GazeRecorder. (2021, September 21). https://gazerecorder.com/ 

Mali, K. (2024, January 23). Everything you need to know about linear regression!. Analytics Vidhya. https://www.analyticsvidhya.com/blog/2021/10/everything-you-need-to-know-about-linear-regression/ 

P. Miah, M. R. Gulshan and N. Jahan, "Mouse Cursor Movement and Control using Eye Gaze- A Human Computer Interaction," 2022 International Conference on Artificial Intelligence of Things (ICAIoT), Istanbul, Turkey, 2022, pp. 1-6, doi: 10.1109/ICAIoT57170.2022.10121742. keywords: {Human computer interaction;Three-dimensional displays;Image recognition;MIMICs;Speech recognition;Cameras;Mice;Eye Gaze;Human Computer Interaction;Feature-based Classification;Conventional Mouse},