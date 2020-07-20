import React, { useState, useEffect } from 'react';

import './Game.css';

const MATCH_STATUS = {
  notStarted: 'notStarted',
  firstInningsInProgress: 'firstInningsInProgress',
  firstInningsPaused: 'firstInningsPaused',
  firstInningsCompleted: 'firstInningsCompleted',
  secondInningsInProgress: 'secondInningsInProgress',
  secondInningsPaused: 'secondInningsPaused',
  matchCompleted: 'matchCompleted',
};

const inningsInitialState = {
  totalScore: 0,
  wicketsLeft: 10,
  oversLeft: 20,
  currentOver: '',
  currentOverBallsLeft: 6,
  allOversScores: [],
  currentBowler: {},
  currentBatsMen: [],
  batsMenScores: [],
  bowlerDetails: [],
};

function BatsManScoreDetail(name) {
  this.name = name;
  this.runs = 0;
  this.ballsPlayed = 0;
  this.fours = 0;
  this.sixes = 0;
  this.wicketBy = '';
  this.StrickRate = 0;
}

function BowlerWicketsDetails(name) {
  this.name = name;
  this.overs = 0;
  this.runs = 9;
  this.wickets = '';
  this.economy = '';
  this.zeros = 0;
  this.fours = 0;
  this.sixes = 0;
  this.wides = 0;
  this.noBalls = 0;
}

function useInnings(teamName) {
  const [inningsState, setInningsState] = useState(inningsInitialState);
  const [currentBallValue, setCurrentBallValue] = useState(undefined);
  const [intervalId, setIntervalId] = useState(null);
  const {
    totalScore,
    wicketsLeft,
    oversLeft,
    currentOver,
    currentOverBallsLeft,
    allOversScores,
  } = inningsState;

  const bowl = () => {
    const values = [0, 1, 2, 3, 4, 5, 6, 'wd', 'nb', 'out'];
    return values[Math.floor(Math.random() * values.length)];
  };

  const setInningsStateHelper = (key, value) => {
    setInningsState({
      ...inningsState,
      [key]: value,
    });
  };

  useEffect(() => {
    if (currentBallValue !== undefined) {
      let currentOverStr = currentOver;
      const inningsUpdatedState = {};
      if (currentBallValue === 'wd' || currentBallValue === 'nb') {
        inningsUpdatedState.totalScore = totalScore + 1;
      } else if (currentBallValue === 'out') {
        inningsUpdatedState.wicketsLeft = wicketsLeft - 1;
        inningsUpdatedState.currentOverBallsLeft = currentOverBallsLeft - 1;
      } else {
        inningsUpdatedState.totalScore = totalScore + currentBallValue;
        inningsUpdatedState.currentOverBallsLeft = currentOverBallsLeft - 1;
      }

      if (currentOverBallsLeft === 1) {
        inningsUpdatedState.currentOverBallsLeft = 6;
        inningsUpdatedState.oversLeft = oversLeft - 1;
        inningsUpdatedState.currentOver = '';
        inningsUpdatedState.allOversScores = [
          ...allOversScores,
          currentOverStr,
        ];
      } else {
        if (currentOverStr) {
          currentOverStr += `,${currentBallValue}`;
        } else {
          currentOverStr += `${currentBallValue}`;
        }
        inningsUpdatedState.currentOver = currentOverStr;
      }
      setInningsState({
        ...inningsState,
        ...inningsUpdatedState,
      });
      console.log(
        `${teamName} ${totalScore}/${10 - wicketsLeft} (${20 - oversLeft}.${
          6 - currentOverBallsLeft
        })`
      );
    }
  }, [currentBallValue]);

  //   const assignBowler = (nextBowlerIndex) => {
  //     const nextBowler = bowlers[nextBowlerIndex];
  //     const nextBowlerDetails = bowlerDetails.find((bowler) => {
  //       return bowler.id === nextBowler.id;
  //     });
  //     if (!nextBowlerDetails) {
  //       bowlerDetails.push(new BowlerWicketsDetails(nextBowler.name));
  //       setInningsStateHelper(
  //         'currentBowler',
  //         bowlerDetails[bowlerDetails.length - 1]
  //       );
  //     } else {
  //       setInningsStateHelper('currentBowler', nextBowlerDetails);
  //     }
  //   };

  //   const assignBatsMan = (nextBatsManIndex) => {
  //     const nextBatsMan = batsMen[nextBatsManIndex];
  //     const nextBatsManDetails = batsMenScores.find((batsMan) => {
  //       return batsMan.id === nextBatsMan.id;
  //     });
  //     if (!nextBatsManDetails) {
  //       batsMenScores.push(new BatsManScoreDetail(nextBatsMan.name));
  //       setInningsStateHelper(
  //         'currentBatsMan',
  //         batsMenScores[batsMenScores.length - 1]
  //       );
  //     } else {
  //       setInningsStateHelper('currentBatsMan', nextBatsManDetails);
  //     }
  //   };

  const startInnings = () => {
    const intervalId = setInterval(() => {
      if (oversLeft && wicketsLeft) {
        setCurrentBallValue(bowl());
      }
    }, 1000);
    setIntervalId(intervalId);
  };

  const stopInnings = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const pauseInnings = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return { teamName, inningsState, startInnings, pauseInnings, stopInnings };
}

const Game = () => {
  const [matchStatus, setMatchStatus] = useState(MATCH_STATUS.notStarted);
  const [controllerLabel, setControllerLabel] = useState('Start');
  const {
    teamName: team1,
    inningsState: firstInnings,
    startInnings: startFirstInnings,
    pauseInnings: pauseFirstInnings,
    stopInnings: stopFirstInnings,
  } = useInnings('Team1');
  const {
    teamName: team2,
    inningsState: secondInnings,
    startInnings: startSecondInnings,
    pauseInnings: pauseSecondInnings,
    stopInnings: stopSecondInnings,
  } = useInnings('Team2');

  useEffect(() => {
    if (!firstInnings.oversLeft || !firstInnings.wicketsLeft) {
      setMatchStatus(MATCH_STATUS.secondInningsInProgress);
      stopFirstInnings();
      startSecondInnings();
    }
  }, [firstInnings.oversLeft, firstInnings.wicketsLeft]);

  useEffect(() => {
    if (!secondInnings.oversLeft || !secondInnings.wicketsLeft) {
      stopSecondInnings();
      setMatchStatus(MATCH_STATUS.matchCompleted);
      setControllerLabel('Start');
    }
  }, [secondInnings.oversLeft, secondInnings.wicketsLeft]);

  const getMatchControllerAction = () => {
    let controller;
    if (matchStatus === MATCH_STATUS.notStarted) {
      controller = () => {
        setMatchStatus(MATCH_STATUS.firstInningsInProgress);
        startFirstInnings();
        setControllerLabel('Stop');
      };
    } else if (matchStatus === MATCH_STATUS.firstInningsInProgress) {
      controller = () => {
        pauseFirstInnings();
        setMatchStatus(MATCH_STATUS.firstInningsPaused);
        setControllerLabel('Start');
      };
    } else if (matchStatus === MATCH_STATUS.firstInningsPaused) {
      controller = () => {
        startFirstInnings();
        setMatchStatus(MATCH_STATUS.firstInningsInProgress);
        setControllerLabel('Stop');
      };
    } else if (matchStatus === MATCH_STATUS.firstInningsCompleted) {
      controller = () => {
        setMatchStatus(MATCH_STATUS.secondInningsInProgress);
        startSecondInnings();
        setControllerLabel('Stop');
      };
    } else if (matchStatus === MATCH_STATUS.secondInningsInProgress) {
      controller = () => {
        pauseSecondInnings();
        setControllerLabel('Start');
      };
    } else if (matchStatus === MATCH_STATUS.secondInningsPaused) {
      controller = () => {
        startSecondInnings();
        setMatchStatus(MATCH_STATUS.secondInningsInProgress);
        setControllerLabel('Stop');
      };
    }
    return controller;
  };

  return (
    <div className="flex-container">
      <div className="game-container">
        <div className="scores-container">
          <div className="innings-score" style={{ backgroundColor: 'brown' }}>
            <div>{`${team1} ${firstInnings.totalScore}/${
              10 - firstInnings.wicketsLeft
            } (${20 - firstInnings.oversLeft}.${
              6 - firstInnings.currentOverBallsLeft
            })`}</div>
            <div>{firstInnings.currentOver}</div>
          </div>
          <div
            style={{ backgroundColor: 'blueviolet' }}
            className="innings-score"
          >
            <div>{`${team2} ${secondInnings.totalScore}/${
              10 - secondInnings.wicketsLeft
            } (${20 - secondInnings.oversLeft}.${
              6 - secondInnings.currentOverBallsLeft
            })`}</div>
            <div>{secondInnings.currentOver}</div>
          </div>
        </div>
        <div className="match-controller-container">
          <button
            className="match-controller-btn"
            onClick={getMatchControllerAction()}
          >
            {controllerLabel}
          </button>
        </div>
        {matchStatus === MATCH_STATUS.matchCompleted ? (
          <div className="winner-display-container">
            <div className="winner">
              {`Winner:
          ${
            firstInnings.totalScore > secondInnings.totalScore ? team1 : team2
          }!!`}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Game;
