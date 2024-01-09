import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import "./Gameboard.css"
import { Unity, useUnityContext } from "react-unity-webgl";
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import $, { error, type } from "jquery"
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { Suspense } from 'react';

import Wincard from '../Wincards/Wincard';
import axios from 'axios';
import Navbar from '../Navigation/Navbar';
import Switch from '@material-ui/core/Switch';
import CustomSwitch from '../Coustom/Switch/CustomSwitch';
import ClipLoader from "react-spinners/ClipLoader"
var UserBets = React.lazy(() => import("../Bets/UserBets"))
var AllBets = React.lazy(() => import('../Bets/AllBets'))
var TopBets = React.lazy(() => import("../Bets/TopBets/TopBets"))
// socket library i used for make connection from server socket

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
// API URI PREFIX
let uriPrefix = "http://localhost:9000/helix"
const Gameboard = () => {

    const [currentBet, setCurrentBet] = useState(null);
    const [user, setUser] = useState(null);
    var [firstbettingAmount, setFirstBettingAmount] = useState(10);
    var [secondBettingAmount, setSecondBettingAmount] = useState(10);
    const [showPlaceFirstBet, setShowPlaceFirstBet] = useState(true);
    const [showPlaceSecondBet, setShowPlaceSecondBet] = useState(true);
    const [firstBetAccepted, setFirstBetAccepted] = useState(false);
    const [secondBetAccepted, setSecondBetAccepted] = useState(false);
    var [reducerValue, forceUpdate] = useReducer(x => x + 1, 0)
    const [history, setHistory] = useState("ALL_BETS");
    const [showFirstBetCollectAmount, setShowFirstBetCollectAmount] = useState(false);
    const [showSecondBetCollectAmount, setShowSecondBetCollectAmount] = useState(false);
    const [firstBetWinAmount, setFirstBetWinAmount] = useState(0);
    const [secondBetWinAmount, setSecondBetWinAmount] = useState(0);
    const [firstBetWin, setFirstBetWin] = useState(false);
    const [secondBetWin, setSecondBetWin] = useState(false);
    // create stats for the navigation bar
    const [hide, setHide] = useState(true);
    const [soundChecked, setSoundChecked] = useState(true);
    const [musicChecked, setMusicChecked] = useState(true);
    // states for the auto bets
    const [firstBetAutoCollectBetNumber, setFirstBetAutoCollectBetNumber] = useState(0);
    const [secondBetAutoCollectBetNumber, setSecondBetAutoCollectBetNumber] = useState(1);
    const [firstBetIsAuto, setFirstBetIsAuto] = useState(false);
    const [secondBetIsAuto, setSecondBetIsAuto] = useState(false);
    const [firstBetIsAutoCollect, setFirstBetIsAutoCollect] = useState(false);
    const [secondBetIsAutoCollect, setSecondBetIsAutoCollect] = useState(false);
    const [userBetStatus, setUserBetStatus] = useState({});
    const [gameStatus, setGameStatus] = useState(null);
    const [userCurrentBets, setUserCurrentBets] = useState(null);

    // create a useref for socket connections
    const socket = useRef();
    var [liveBetNumber, setLiveBetNumber] = useState(0);
    var [firstBetCollectingAmount, setFirstBetCollectingAmount] = useState(0);
    var [secondBetCollectingAmount, setSecondBetCollectingAmount] = useState(0);
    var [aeroplanIsCrashed, setAeroPlanCrash] = useState(false);
    var [gameisStart, setGameIsStart] = useState(false);
    var [placeFirstBetForNextRound, setPlaceFirstBetForNextRound] = useState(false);
    // create active tab styling
    useEffect(() => {
        let tabs = document.querySelectorAll(".bet-tab");
        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((current) => {
                    current.classList.remove("active-tab")
                });
                tab.classList.add("active-tab")
            })
        })
    }, [])

    // set the unity game options
    var { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: process.env.PUBLIC_URL + "/Build/TestSemi.loader.js",
        dataUrl: process.env.PUBLIC_URL + "/Build/TestSemi.data",
        frameworkUrl: process.env.PUBLIC_URL + "/Build/TestSemi.framework.js",
        codeUrl: process.env.PUBLIC_URL + "/Build/TestSemi.wasm",
    });


    // call the add event listner function on added any listner in helix build
    useEffect(() => {
        addEventListener("GetFloatValue", (betnumber) => {
            let number = parseFloat(betnumber);
            setLiveBetNumber(number);
        });

        addEventListener("GetGameStart", (gameisStart) => {
            setGameIsStart(gameisStart)
        });

        addEventListener("HelicopterBurstGet", (aeroplanCrash) => {
            setAeroPlanCrash(aeroplanCrash)
        });

        addEventListener("GetLoadStart", (gameLoading) => {
            console.warn("game is loading" + gameLoading)
        });


    }, [addEventListener, removeEventListener])

    // call the add event listner function on added any listner in helix build

    /* call the useEffect on every time for check 
    game status like game is start or aeroplan is crashed */

    useEffect(() => {
        let getGameStatus = async () => {
            await axios.get(`${uriPrefix}/game/getgame-status`)
                .then((response) => {
                    console.log(response);
                    if (response.data.result) {
                        setGameStatus(response.data.gameStatus);
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
        }
        getGameStatus();
    }, [liveBetNumber, userBetStatus, firstBetAccepted, secondBetAccepted, firstBetWin, secondBetWin])


    //Owl Carousel Settings
    const options = {
        loop: true,
        center: false,
        items: 15,
        autoplay: false,
        dots: false,
        autoplayTimeout: 8500,
        smartSpeed: 450,
        nav: false,
        responsiveClass: true,
        responsive: {
            0: {
                items: 10,
                center: true,
                margin: 0
            },
            600: {
                items: 12,
                dotData: true,
                dotsData: true,
                nav: false,
            },
            768: {
                items: 14,
                margin: 20,
                center: true
            },
            800: {
                items: 14,
                margin: 20,
                center: true
            },
            1000: {
                items: 15,
                dotData: true,
                dotsData: true,
                nav: false,
                dots: true
            }
        }

    };
    // hide the alerts after some time
    // get user placed current bets
    useEffect(() => {
        let userid = "shubh@gmail.com"
        const getUserCurrentBets = async () => {
            await axios.get(`${uriPrefix}/bet/get-userplaced-betsnumber/${userid}`)
                .then((response) => {
                    console.log(response);
                    // set the user placed bet detals
                    if (response.data.result) {
                        setUserCurrentBets(response.data.placedBetsDetails)
                    }
                    if (response.data.internalServerError) {
                        alert("internal server error")
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        // call the getCurrentBets function
        getUserCurrentBets();
    }, [])


    // on place first bet
    const placeFirstBet = async () => {

        // create place bet object
        const firstBetDetails = {
            username: "shubham choudhary",
            email: "shubh@gmail.com",
            betnumber: liveBetNumber,
            betamount: firstbettingAmount,
        }

        // post the bet
        await axios.post(`${uriPrefix}/bet/placefirstbet`, firstBetDetails, config)
            .then((response) => {

                if (response.data.success) {
                    setFirstBetAccepted(true);
                    setShowPlaceFirstBet(false);
                    forceUpdate();
                } else {
                    setFirstBetAccepted(false);
                }
            })
            .catch((error) => {
                console.log(error)
            })



    }


    // on place first bet
    const placeSecondBet = async () => {
        // play the place bet sound on place bet
        // let place_bet_audio = document.getElementById("second-bet-placed-audio")
        // place_bet_audio.play();

        // create place bet object
        const secondBetDetails = {
            username: "shubham choudhary",
            email: "shubh@gmail.com",
            betnumber: liveBetNumber,
            betamount: secondBettingAmount,
        }

        // post the bet

        await axios.post(`${uriPrefix}/bet/placesecondbet`, secondBetDetails, config)
            .then((response) => {
                if (response.data.success) {
                    setSecondBetAccepted(true);
                    setShowPlaceSecondBet(false);
                    forceUpdate();
                    // for testing
                    setTimeout(() => {

                        setShowSecondBetCollectAmount(true);

                    }, 2000);

                } else {
                    setSecondBetAccepted(false);
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    // calculate the user bet amount collect money
    useEffect(() => {
        let total = ((liveBetNumber) * (firstbettingAmount)).toFixed(2)
        setFirstBetCollectingAmount(total)
    }, [liveBetNumber]);

    useEffect(() => {
        let total = ((liveBetNumber) * (firstbettingAmount)).toFixed(2)
        setSecondBetCollectingAmount(total)
    }, [liveBetNumber]);


    // check conditions for next found
    useEffect(() => {
        if (gameisStart === 1 && !firstBetAccepted) {
            setPlaceFirstBetForNextRound(true)
        } else {
            setPlaceFirstBetForNextRound(false);
            setShowCancleButton(false);
        }
    }, [gameisStart, addEventListener])



    // get the bet status
    const getUserBetStatus = async () => {
        await axios.get(`${uriPrefix}/bet/mybet-status/Demouser1`)
            .then((response) => {
                setUserBetStatus(response.data.betStatus);
                setFirstBetIsAuto(response.data.betStatus.FirstBetIsAuto);
                setSecondBetIsAuto(response.data.betStatus.SecondBetIsAuto);
                setFirstBetIsAutoCollect(response.data.betStatus.FirstBetIsAutoCollect)
                setSecondBetIsAutoCollect(response.data.betStatus.SecondBetIsAutoCollect)
            })
            .catch((error) => {
                console.log(error)
            })
    }


    // on collect first bet amout successfully
    const onCollectFirstBetAmount = async (winAmount) => {

        // create the winnig bet details object
        const winingDetails = {
            email: "shubh@gmail.com",
            winingstatus: "win",
            lossamount: "0",
            winamount: winAmount,
            isFirstBet: true,
            isSecondBet: false
        }
        // post details to server for saving winging bet history
        await axios.post(`${uriPrefix}/bet/firstbet-win`, winingDetails, config)
            .then((response) => {
                // on win the bet we are store history
                if (response.data.success) {
                    forceUpdate();
                    if (winAmount > 0) {
                        setFirstBetWin(true);
                    } else {
                        setFirstBetWin(false);
                    }
                    setFirstBetWinAmount(winAmount);
                    setShowFirstBetCollectAmount(false);
                    setShowPlaceFirstBet(true);
                    setFirstBettingAmount(10.00);
                    getUserBetStatus();
                    if (userBetStatus?.FirstBetIsAuto) {
                        setFirstBetAccepted(true);
                    } else {
                        setFirstBetAccepted(false);
                    }
                    // hide the win info card
                    setTimeout(() => {
                        setFirstBetWin(false);
                    }, 2000);
                }
            })
            .catch((error) => {
                throw error;
                console.log(error)
            })
    }

    const onAutoCollectFirstBetAmount = async (betnumber, winAmount) => {
        // create the winnig bet details object
        const winingDetails = {
            email: "shubh@gmail.com",
            betnumber: betnumber,
            winingstatus: "win",
            lossamount: "0",
            winamount: winAmount,
            isFirstBet: true,
            isSecondBet: false
        }
        // post details to server for saving winging bet history
        await axios.post(`${uriPrefix}/bet/firstbet-win`, winingDetails, config)
            .then((response) => {
                // on win the bet we are store history
                if (response.data.success) {
                    forceUpdate();
                    setFirstBetWin(true);
                    setFirstBetWinAmount(winAmount);
                    setShowFirstBetCollectAmount(false);
                    setShowPlaceFirstBet(true);
                    // hide the win info card
                    setTimeout(() => {
                        getUserBetStatus();
                        setFirstBetWin(false);
                    }, 2000);
                }
            })
            .catch((error) => {
                throw error;
                console.log(error)
            })
    }



    // on collect second bet amout
    const onCollectSecondBetAmount = async (winAmount) => {
        // create wining details
        const winingDetails = {
            email: "shubh@gmail.com",
            winingstatus: "win",
            lossamount: "0",
            winamount: winAmount,
            isFirstBet: false,
            isSecondBet: true
        }
        await axios.post(`${uriPrefix}/bet/secondbet-win`, winingDetails, config)
            .then((response) => {
                // when win history save successfully
                if (response.data.success) {
                    setSecondBetWin(true);
                    setSecondBetWinAmount(winAmount);
                    forceUpdate();
                    setShowSecondBetCollectAmount(false);
                    setShowPlaceSecondBet(true);

                    // hide the win info card
                    setTimeout(() => {
                        getUserBetStatus();
                        setSecondBetWin(false);
                    }, 2000);
                }
            })
            .catch((error) => {
                throw error;
                console.log(error)
            })
    }


    // post the bet status
    const onPostAutoBetStatus = async (firstBetAutoStatus, secondBetAutoStatus) => {
        let betStatus = {
            userid: "Demouser1",
            firstBetIsAuto: firstBetAutoStatus,
            secondBetIsAuto: secondBetAutoStatus,
            firstBetIsAutoCollect: false,
            secondBetIsAutoCollect: false
        };

        try {
            const response = await axios.post(`${uriPrefix}/bet/set-betstatus`, betStatus, config);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };
    // update the first bet status and post the bet status
    const onFirstBetAuto = (e) => {
        setFirstBetIsAuto((previous) => {
            const firstBetStatus = !previous;
            onPostAutoBetStatus(firstBetStatus, secondBetIsAuto);
            return firstBetStatus;
        });
    };

    // update the second bet status and post the bet status
    const onSecondBetAuto = (e) => {
        setSecondBetIsAuto((previous) => {
            const secondeBetStatus = !previous;
            onPostAutoBetStatus(firstBetIsAuto, secondeBetStatus);
            return secondeBetStatus;
        });
    };


    // change the color of hitory
    useEffect(() => {
        let histories = document.querySelectorAll(".history");
        histories?.forEach((history, index) => {
            if (index % 2 == 0) {
                history.style.color = "#C86325";
            }
        })
    }, [])

    // if game is over then we are set 0 values on Win Amount

    useEffect(() => {
        if (aeroplanIsCrashed) {
            setFirstBetCollectingAmount(0);
            setSecondBetCollectingAmount(0);
        }
    }, [liveBetNumber, aeroplanIsCrashed])

    // place the bet automatically when the userbet status is auto
    useEffect(() => {
        if (firstBetIsAuto && !placeFirstBetForNextRound) {
            placeFirstBet();
        }
    }, [userBetStatus, firstBetAccepted, liveBetNumber, gameisStart, aeroplanIsCrashed]);

    // if user bet is placed and game is start then we are show win amount on collect amount button
    useEffect(() => {
        if (firstBetAccepted && gameisStart === 1) {

            setShowFirstBetCollectAmount(true);
        }
    }, [firstBetAccepted, gameisStart, addEventListener]);


    // get user bet status
    useEffect(() => {
        getUserBetStatus();
    }, [])


    // check second bet is auto and call function
    useEffect(() => {
        if (secondBetIsAuto) {
            if (gameisStart) {
                placeSecondBet();
            }
        }
    }, [userBetStatus, gameisStart, aeroplanIsCrashed]);


    // post the bet is auto collect 
    const onPostAutoCollectStatus = async (firstBetAutoCollectStatus, secondBetAutoCollectStatus) => {
        let betStatus = {
            userid: "Demouser1",
            firstBetIsAuto: firstBetIsAuto,
            secondBetIsAuto: secondBetIsAuto,
            firstBetIsAutocCollect: firstBetAutoCollectStatus,
            secondBetIsAutoCollect: secondBetAutoCollectStatus
        };
        try {
            const response = await axios.post(`${uriPrefix}/bet/set-betstatus`, betStatus, config);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }


    // post the first bet is auto collect for update the bet status
    const onFirstBetAutoCollect = (e) => {
        setFirstBetIsAutoCollect((previous) => {
            let firstAutoCollectStatus = !previous;
            onPostAutoCollectStatus(firstAutoCollectStatus, secondBetIsAutoCollect);
            return firstAutoCollectStatus;
        });
    }

    /* if auto collect is on then we are check user enter auto collect bet number is equal to live 
    current bet number if is true then we are call the win function and pass win amount
    */
    // This effect handles the auto-collecting of the first bet.
    useEffect(() => {
        const liveNumber = parseFloat(liveBetNumber);
        const autoCollectNumber = parseFloat(firstBetAutoCollectBetNumber);

        // Make sure we're in the right state to auto-collect.
        if (firstBetIsAutoCollect && firstBetAccepted && gameisStart === 1) {
            // Define a small range for comparison to handle floating-point imprecision.
            const delta = 0.01; // This delta should be small enough for your game's precision requirements.

            // Check if the live number is close enough to the target number to consider them equal.
            if (Math.abs(liveNumber - autoCollectNumber) < delta) {
                // Call the function to handle the auto-collect.
                onCollectFirstBetAmount(firstBetCollectingAmount);
            }
        }
        // Include only the relevant dependencies.
    }, [firstBetIsAutoCollect, firstBetAccepted, liveBetNumber,
        firstBetAutoCollectBetNumber, firstBetCollectingAmount, gameisStart, addEventListener]);


    // useEffect(() => {
    //     if (firstBetAccepted && aeroplanIsCrashed === 1 ) {
    //         onCollectFirstBetAmount(0);

    //     }
    //     // if(firstBetAccepted && gameStatus.AeroplanCrash){

    //     // }
    // }, [gameisStart, aeroplanIsCrashed, addEventListener])


    /*
        create functions for place bet for next round
    */


    const [showCancleButton, setShowCancleButton] = useState(false);
    const onPlaceFirstBetForNextRound = () => {
        if (placeFirstBetForNextRound) {
            setShowCancleButton((prev) => {
                let prevCancleBtnStatus = !prev;
                placeFirstBet();
                return prevCancleBtnStatus;
            });

        } else {
            setShowCancleButton(false);
        }
    }

    // cancle place bet for next round
    const canclePlaceFirstBetForNextRound = () => {
        if (gameisStart === 1 && placeFirstBetForNextRound) {
            setShowCancleButton(false);
            setPlaceFirstBetForNextRound(true);
        } else {
            setShowCancleButton(false);
            setPlaceFirstBetForNextRound(false);
        }
    }


    return <>
        <section className="gameboard-section">
            <div className="gameboard-container">
                <div className="game-section">
                    <Navbar firstBetAccepted={firstBetAccepted} secondBetAccepted={secondBetAccepted}
                        firstBetWin=
                        {firstBetWin} secondBetWin={secondBetWin} />
                    <div className="game-history-header">
                        <ul className='histories' id='history-box'>
                            <OwlCarousel id="customer-testimonoals" className="owl-carousel owl-theme" {...options}>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>
                                <li className='history'>1.2x</li>


                            </OwlCarousel>
                        </ul>
                        <div className="history-btn">
                            <img src={process.env.PUBLIC_URL + "/Photos/webPhotos/history-btn.png"} alt="" />
                        </div>
                    </div>
                    <div className="unity-game-box">
                        <div className="canvas">
                            <Unity style={{
                                margin: 'auto'
                            }} className='unity' unityProvider={unityProvider} />
                        </div>
                    </div>

                    {/* game controllers */}

                    <div className="game-controllers-section">
                        <div className="gamecontrollers-container">
                            <div className="left-controllers">
                                <div className="play-bet-controllers">
                                    <div className="auto-bet">
                                        <div className="autobet-btn-header">
                                            <div className='speed'>X<span>2</span></div>
                                            <div className="info autobet-btn">
                                                auto bet<CustomSwitch
                                                    checked={firstBetIsAuto}
                                                    value={firstBetIsAuto}
                                                    onChange={onFirstBetAuto} />
                                            </div>
                                        </div>
                                        <div className="autobet-controller">
                                            <button
                                                className={firstbettingAmount < 11 ? 'decrease disabled' : 'decrease'}
                                                disabled={showPlaceFirstBet ? false : true}
                                                disabled={firstbettingAmount < 11 ? true : false} onClick={() => setFirstBettingAmount(firstbettingAmount - 5)}><i class="uil uil-minus"></i></button>
                                            <div className="bet-value">{firstbettingAmount}</div>
                                            <button disabled={showPlaceFirstBet ? false : true} onClick={() => setFirstBettingAmount(firstbettingAmount + 5)} className="increase">+</button>
                                        </div>
                                    </div>
                                    <div className="auto-collect">
                                        <div className="autocollect-btn-header">
                                            <div className="autocollect-btn">
                                                auto collect
                                                <CustomSwitch
                                                    checked={firstBetIsAutoCollect}
                                                    value={firstBetIsAutoCollect}
                                                    onChange={onFirstBetAutoCollect}
                                                />
                                            </div>
                                        </div>
                                        <div className="autocollect-controller">
                                            <button
                                                onClick={() => setFirstBetAutoCollectBetNumber(firstBetAutoCollectBetNumber - 1)}
                                                disabled={firstBetAutoCollectBetNumber < 2 ? true : false}
                                                className={firstBetAutoCollectBetNumber < 2 ? "decrease disabled" : "decrease"}
                                            >
                                                <i class="uil uil-minus"></i></button>
                                            <div className="bet-value">{firstBetAutoCollectBetNumber}.00x</div>
                                            <button
                                                onClick={() => setFirstBetAutoCollectBetNumber(firstBetAutoCollectBetNumber + 1)}
                                                className="increase">+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="autobet-values-place-bet-btn">
                                    <div className="autobet-betvalues">
                                        <div className="betvalue" onClick={() => setFirstBettingAmount("20.00")}>20.00</div>
                                        <div className="betvalue" onClick={() => setFirstBettingAmount("50.00")}>50.00</div>
                                        <div className="betvalue" onClick={() => setFirstBettingAmount("100.00")}>100.00</div>
                                        <div className="betvalue" onClick={() => setFirstBettingAmount("200.00")}>all</div>
                                    </div>
                                    <div className="placebet-btn">
                                        <audio id='first-bet-placed-audio' controls={false}>
                                            <source src={process.env.PUBLIC_URL + "/Audios/placebet.mp3"} type="audio/ogg" />
                                        </audio>
                                        <button hidden={!showCancleButton || !placeFirstBetForNextRound ? false : true}>
                                            <div hidden={showPlaceFirstBet && !showFirstBetCollectAmount
                                                && !firstBetAccepted && !placeFirstBetForNextRound
                                                ? false : true}
                                                className="place-bet-mssg"
                                                onClick={placeFirstBet}>place your bet </div>
                                            <div hidden={placeFirstBetForNextRound ? false : true}
                                                className="placebet-fornext-round" onClick={onPlaceFirstBetForNextRound}>
                                                place your bet
                                                <div className='for-next-round-text'>for next round</div>
                                            </div>
                                            <div hidden={firstBetAccepted && !showFirstBetCollectAmount ?
                                                false : true}
                                                className="bet-accepted-mssg">bet <br></br> Accepted</div>
                                            <div onClick={() => onCollectFirstBetAmount(firstBetCollectingAmount)}
                                                hidden={showFirstBetCollectAmount ? false : true}
                                                className="collect-amount">
                                                {firstBetCollectingAmount} DEMO
                                                <div className='collect-text'>  collect</div>
                                            </div>
                                        </button>
                                        <button className='cancle-nextround-bet-button'
                                            hidden={showCancleButton && placeFirstBetForNextRound ? false : true}
                                            onClick={canclePlaceFirstBetForNextRound}
                                        >
                                            cancle
                                        </button>
                                    </div>
                                </div>
                                {
                                    firstBetWin ? <Wincard amount={firstBetWinAmount} position={"left"} /> : ""
                                }

                            </div>
                            <div className="right-controllers">
                                <div className="play-bet-controllers">
                                    <div className="auto-bet">
                                        <div className="autobet-btn-header">
                                            <div className='speed'>X<span>2</span></div>
                                            <div className="info autobet-btn">
                                                auto bet<CustomSwitch
                                                    checked={secondBetIsAuto}
                                                    value={secondBetIsAuto}
                                                    onChange={onSecondBetAuto}
                                                />
                                            </div>
                                        </div>
                                        <div className="autobet-controller">
                                            <button
                                                className={secondBettingAmount < 11 ? 'decrease disabled' : 'decrease'}
                                                disabled={showPlaceSecondBet ? false : true}
                                                disabled={secondBettingAmount < 11 ? true : false} onClick={() => setSecondBettingAmount(secondBettingAmount - 5)}><i class="uil uil-minus"></i>
                                            </button>
                                            <div className="bet-value">{secondBettingAmount}</div>
                                            <button disabled={showPlaceFirstBet ? false : true}
                                                onClick={() => setSecondBettingAmount(secondBettingAmount + 5)} className="increase">+</button>
                                        </div>
                                    </div>
                                    <div className="auto-collect">
                                        <div className="autocollect-btn-header">
                                            <div className="autocollect-btn">
                                                auto collect<CustomSwitch />
                                            </div>
                                        </div>
                                        <div className="autocollect-controller">
                                            <button
                                                onClick={() => setSecondBetAutoCollectBetNumber(secondBetAutoCollectBetNumber - 1)}
                                                disabled={secondBetAutoCollectBetNumber < 2 ? true : false}
                                                className={secondBetAutoCollectBetNumber < 2 ? "decrease disabled" : "decrease"}
                                            >
                                                <i class="uil uil-minus"></i>
                                            </button>
                                            <div className="bet-value">{secondBetAutoCollectBetNumber}.00x</div>
                                            <button
                                                onClick={() => setSecondBetAutoCollectBetNumber(secondBetAutoCollectBetNumber + 1)}
                                                className="increase">+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="autobet-values-place-bet-btn">
                                    <div className="autobet-betvalues">
                                        <div className="betvalue" onClick={() => setSecondBettingAmount("20.00")}>20.00</div>
                                        <div className="betvalue" onClick={() => setSecondBettingAmount("50.00")}>50.00</div>
                                        <div className="betvalue" onClick={() => setSecondBettingAmount("100.00")}>100.00</div>
                                        <div className="betvalue" onClick={() => setSecondBettingAmount("200.00")}>all</div>
                                    </div>
                                    <div className="placebet-btn">
                                        <audio id='second-bet-placed-audio' controls={false}>
                                            <source src={process.env.PUBLIC_URL + "/Audios/placebet.mp3"} type="audio/ogg" />
                                        </audio>
                                        <button>
                                            <div hidden={showPlaceSecondBet ? false : true} className="place-bet-mssg"
                                                onClick={placeSecondBet}>place your bet </div>
                                            <div hidden={secondBetAccepted ? false : true}
                                                className="bet-accepted-mssg">bet <br></br> Accepted</div>
                                            <div onClick={() => onCollectSecondBetAmount(secondBetCollectingAmount)}
                                                hidden={showSecondBetCollectAmount ? false : true}
                                                className="collect-amount">
                                                {secondBetCollectingAmount} DEMO
                                                <div>collect</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                {
                                    secondBetWin ? <Wincard amount={secondBetWinAmount} position={"right"} /> : ""
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="gamebets-section">
                    <div className="gamebets-tabs">
                        <button className='bet-tab active-tab' onClick={() => setHistory("ALL_BETS")}>bets all</button>
                        <button className='bet-tab' onClick={() => setHistory("MY_BETS")}>my bets</button>
                        <button className='bet-tab' onClick={() => setHistory("TOP_BETS")}>top</button>
                    </div>
                    <div className="gamebets-details">
                        {history === "ALL_BETS" ?
                            <Suspense fallback={<ClipLoader size={30} color='#fff' className='bets-loader' />}>
                                <AllBets value={reducerValue} firstBetAccepted={firstBetAccepted}
                                    secondBetAccepted={secondBetAccepted} />
                            </Suspense>
                            : ""}
                        {history === "MY_BETS" ?
                            <Suspense fallback={<ClipLoader size={30} color='#fff' className='bets-loader' />}>
                                <UserBets value={reducerValue} firstBetAccepted={firstBetAccepted}
                                    secondBetAccepted={secondBetAccepted} />
                            </Suspense>
                            : ""}
                        {history === "TOP_BETS" ?
                            <Suspense fallback={<ClipLoader size={30} color='#fff' className='bets-loader' />}>
                                <TopBets value={reducerValue} />
                            </Suspense>

                            : ""}
                    </div>
                </div>
            </div>
        </section>

    </>
}

export default Gameboard

/*

  <div className="apply-bet-controllers" >
                                        <div className="bet-counter" id={showPlaceFirstBet ? "" : "disabled-applybet-controllers"}>
                                            <button disabled={showPlaceFirstBet ? false : true}
                                             className={firstbettingAmount < 11 ? 'decrease disabled' : 'decrease'} disabled={firstbettingAmount < 11 ? true : false} onClick={() => setFirstBettingAmount(firstbettingAmount - 5)}><i class="uil uil-minus"></i></button>
                                            <div className="count">{firstbettingAmount}</div>
                                            <button className={"increse"} disabled={showPlaceFirstBet ? false : true}
                                                onClick={() => setFirstBettingAmount(firstbettingAmount + 5)}>+</button>
                                        </div>
                                        <div className="bet-values">
                                            <div className="one-to-two"><div>1</div><div>2</div></div>
                                            <div className="five-to-tan"><div>5</div><div>10</div></div>
                                        </div>
                                    </div> 
                                    <div className="play-bet-btn">
                                         <audio id='first-bet-placed-audio' controls={false}>
                                            <source src={process.env.PUBLIC_URL + "/Audios/placebet.mp3"} type="audio/ogg" />
                                        </audio> 

                                         <button>
                                            <div hidden={showPlaceFirstBet ? false : true} className="place-bet-mssg"
                                                onClick={placeFirstBet}>place your bet </div>
                                            <div hidden={firstBetAccepted ? false : true}
                                                className="bet-accepted-mssg">bet <br></br> Accepted</div>
                                            <div onClick={() => onCollectFirstBetAmount(collectFirstBetAmount)}
                                                hidden={showFirstBetCollectAmount ? false : true}
                                                className="collect-amount">
                                                {collectFirstBetAmount} DEMO
                                                <div>collect</div>
                                            </div>
                                        </button> 
                                    </div>

                                    */