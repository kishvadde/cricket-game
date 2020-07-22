/* eslint-disable react-hooks/exhaustive-deps */
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

function InningsInitialState(numberOfOvers) {
  return {
    totalScore: 0,
    wicketsLeft: 10,
    oversLeft: numberOfOvers,
    currentOver: '',
    currentOverBallsLeft: 6,
    allOversScores: [],
  };
}

function useInnings(teamName, numberOfOvers) {
  const [inningsState, setInningsState] = useState(
    new InningsInitialState(numberOfOvers)
  );
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

  useEffect(() => {
    if (!wicketsLeft && oversLeft) {
      setInningsState({
        ...inningsState,
        allOversScores: [...inningsState.allOversScores, currentOver],
      });
    }
  }, [wicketsLeft]);

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

      if (currentOverBallsLeft === 0) {
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
        `${teamName} ${totalScore}/${10 - wicketsLeft} (${
          numberOfOvers - oversLeft
        }.${6 - currentOverBallsLeft})`
      );
    }
  }, [currentBallValue]);

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

  const resetInnings = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setInningsState(new InningsInitialState(numberOfOvers));
    setCurrentBallValue(undefined);
  };

  return { teamName, inningsState, startInnings, stopInnings, resetInnings };
}

const Game = ({ numberOfOvers }) => {
  const [matchStatus, setMatchStatus] = useState(MATCH_STATUS.notStarted);
  const [controllerLabel, setControllerLabel] = useState('Start');

  const {
    teamName: team1,
    inningsState: firstInnings,
    startInnings: startFirstInnings,
    stopInnings: stopFirstInnings,
    resetInnings: resetFirstInnings,
  } = useInnings('Team1', numberOfOvers);
  const {
    teamName: team2,
    inningsState: secondInnings,
    startInnings: startSecondInnings,
    stopInnings: stopSecondInnings,
    resetInnings: resetSecondInnings,
  } = useInnings('Team2', numberOfOvers);

  useEffect(() => {
    setMatchStatus(MATCH_STATUS.notStarted);
    resetFirstInnings();
    resetSecondInnings();
    setControllerLabel('Start');
  }, [numberOfOvers]);

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
        stopFirstInnings();
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
        setMatchStatus(MATCH_STATUS.secondInningsPaused);
        stopSecondInnings();
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
    <div>
      <div className="match-controller-container">
        <button
          className="match-controller-btn"
          onClick={getMatchControllerAction()}
        >
          {controllerLabel}
        </button>
        {matchStatus === MATCH_STATUS.matchCompleted ? (
          <div className="winner-display-container">
            {`Winner:
          ${
            firstInnings.totalScore > secondInnings.totalScore ? team1 : team2
          }!!`}
          </div>
        ) : null}
      </div>
      <div className="scores-container">
        <div
          className="innings-score-container"
          style={{ backgroundColor: '#5148a5' }}
        >
          <div className="innings-score">
            <div>
              {`${team1} ${firstInnings.totalScore}/${
                10 - firstInnings.wicketsLeft
              } (${numberOfOvers - firstInnings.oversLeft}.${
                6 - firstInnings.currentOverBallsLeft
              })`}
            </div>
            {firstInnings.currentOver && (
              <div style={{ marginTop: '20px' }}>
                {firstInnings.currentOver}
              </div>
            )}
          </div>
        </div>
        <div
          className="innings-score-container"
          style={{ backgroundColor: '#93b36f' }}
        >
          <div className="innings-score">
            <div>
              {`${team2} ${secondInnings.totalScore}/${
                10 - secondInnings.wicketsLeft
              } (${numberOfOvers - secondInnings.oversLeft}.${
                6 - secondInnings.currentOverBallsLeft
              })`}
            </div>
            {secondInnings.currentOver && (
              <div style={{ marginTop: '20px' }}>
                {secondInnings.currentOver}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="score-by-overs-container">
        {firstInnings.allOversScores.length ? (
          <div className="scores-table-container">
            <table className="scores-table1">
              <tr>
                <th>Over</th>
                <th>Score</th>
              </tr>
              {firstInnings.allOversScores.map((value, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{value}</td>
                  </tr>
                );
              })}
            </table>
          </div>
        ) : null}
        {secondInnings.allOversScores.length ? (
          <div className="scores-table-container">
            <table className="scores-table2">
              <tr>
                <th>Over</th>
                <th>Score</th>
              </tr>
              {secondInnings.allOversScores.map((value, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{value}</td>
                  </tr>
                );
              })}
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Game;
