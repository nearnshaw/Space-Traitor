# Space Traitor

This is a multiplayer game about deceiving and guessing other player's identities. It takes plenty of inspiration from Among Us, but brings similar mechanics into a 3d medium.

At least 3 (or better 4) players must ring the bell of the space station, then the game starts.

A traitor is picked randomly, that player will secretly play against the others.

# Instructions

### Play online

- In decentraland, deployed at:

https://play.decentraland.org/?position=-64,-34

- Deployed to Vercel Now:

https://space-traitor.vercel.app/?position=-64,-34


### Run locally
- run npm start in server's folder
- change scene/src/config.ts const local: boolean = false to const local: boolean = true
- run dcl start in scene folder
- open 3 tabs at "http://127.94.0.1:8000/?SCENE_DEBUG_PANEL&position=-64,-34&realm=localhost-stub", click on the button by the door to register as a player
- the traitor will be notified

### Test the scene as 1 player

To be able to test the scene as 1 person you can choose the "F" option twice during the button dialogue