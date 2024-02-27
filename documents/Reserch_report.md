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

## Method 3: Iris Cordination

Presentation of the results obtained.

## References

List of references used in the report.