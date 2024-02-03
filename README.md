# CEP-FullStackApp

<p align="center">
  <img src="image.png" alt="">
</p>

## Project summary

### One-sentence description of the project

Our project is to determine if eye tracking that utilizing Google’s Mediapipe could have potential to be implemented in Cephable.

### Additional information about the project

This system would need a variety of benchmarks to determine if it can be a viable option. This include:

* An app to allow us to use a webcam.
* Iris detection, in which we can use our webcam to detect where our pupils are on the screen.
* Multi-screen setup, which will track our entire face and each one of our eyes.
* Coordinate system to track where our pupils are looking at on the screen.
* Virtual boxes on the screen to be used as targets for our eyes to follow.
* A system to track our accuracy when hitting these boxes.

To further explain this list, our final software hopes to achieve a desktop windows application created in electron, written in typescript or javascript to use a webcam that will have three webcam ports, which include our face, a left eye and right eye cam footage.

We will use Mediapipe to implement their iris detection solution. This would involve us first using two virtual boxes on the left and right side of the screen to detect if we can successfully look left and right on our screen using just our pupil. More and more virtual boxes would be added along with a system to track how accurate our detection is being received.

The final goal is for the user to potentially be able to watch videos, do homework, play games, type messages with just the use of their eyes.

## Installation

### Prerequisites

* Git
* Node.js
* Connection to a webcam

### Add-ons

* React
  * React uses for making an application UI
* Electron
  * Electron enable us to make a desktop application
* MediaPipe
  * Used for tracking iris

### Installation Steps

TODO: Describe the installation process (making sure you mention `bundle install`).
Instructions need to be such that a user can just copy/paste the commands to get things set up and running.

1. Download files by `git clone https://github.com/WSUCptSCapstone-S24-F24/-cep-fullstackapp-.git`
2. Install all packages by `npm install`
3. Run `npm run build`
4. Run `npm run electron-start`

## Functionality

After start the application by `npm run electron-start`, the application automaticlly open and start tracking your iris by a webcam.

## Known Problems

* For the specific enviroment, the application uses lots of GPU memory

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Additional Documentation

* Sprint reports
* User links

## License

If you haven't already, add a file called `LICENSE.txt` with the text of the appropriate license.
We recommend using the MIT license: <https://choosealicense.com/licenses/mit/>
