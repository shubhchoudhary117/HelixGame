const express=require("express");
const GameController=require("../../Controllers/GameControllers/GameController.js")

const router=express.Router();


// create routes
router.post("/gamestart",GameController.setGameIsStart);
router.post("/plancrash",GameController.setAeroPlanIsCrashed);
router.get("/getgame-status",GameController.onGetGameStatus)
module.exports=router;