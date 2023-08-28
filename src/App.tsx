import './App.css'
import classNames from 'classnames'

import { useLocalStorage } from './useLocalStorage'

import { GameState, Player } from '../types'

import { deriveGame, deriveStats } from '../lib/utils'

import Footer from './components/Footer'
import Menu from './components/Menu'
import Modal from './components/Modal'

const App = () => {
  const [state, setState] = useLocalStorage<GameState>('game-state-key', {
    currentGameMoves: [],
    history: {
      currentRoundGames: [],
      allGames: [],
    },
  })

  const game = deriveGame(state)
  const stats = deriveStats(state)

  const resetGame = (isNewRound: boolean) => {
    setState((prev) => {
      const stateClone = structuredClone(prev)

      const { status, moves } = game

      if (status.isComplete) {
        stateClone.history.currentRoundGames.push({
          moves,
          status,
        })
      }

      stateClone.currentGameMoves = []

      if (isNewRound) {
        stateClone.history.allGames.push(
          ...stateClone.history.currentRoundGames
        )

        stateClone.history.currentRoundGames = []
      }

      return stateClone
    })
  }

  const handlePlayerMove = (squareId: number, player: Player) => {
    console.log(`Player ${player.id} moved on square ${squareId}`)

    setState((prev) => {
      const stateClone = structuredClone(prev)

      stateClone.currentGameMoves.push({
        squareId,
        player,
      })

      return stateClone
    })
  }

  return (
    <>
      <main>
        <div className="grid">
          <div className={classNames('turn', game.currentPlayer.colorClass)}>
            <i
              className={classNames(
                'fa-solid',
                game.currentPlayer.colorClass,
                game.currentPlayer.iconClass
              )}
            ></i>
            <p>{game.currentPlayer.name}, you're up!</p>
          </div>

          <Menu onAction={(action) => resetGame(action === 'newRound')} />

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((squareId) => {
            const existingMove = game.moves.find(
              (move) => move.squareId === squareId
            )

            return (
              <div
                key={squareId}
                className="square shadow"
                onClick={() => {
                  if (existingMove) return

                  handlePlayerMove(squareId, game.currentPlayer)
                }}
              >
                {existingMove && (
                  <i
                    className={classNames(
                      'fa-solid',
                      existingMove.player.colorClass,
                      existingMove.player.iconClass
                    )}
                  ></i>
                )}
              </div>
            )
          })}

          <div
            className="score shadow"
            style={{ backgroundColor: 'var(--turquoise)' }}
          >
            <p>Player 1</p>
            <span>{stats.playerWithStats[0].wins} Wins</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: 'var(--light-gray)' }}
          >
            <p>Ties</p>
            <span>{stats.ties}</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: 'var(--yellow)' }}
          >
            <p>Player 2</p>
            <span>{stats.playerWithStats[1].wins} Wins</span>
          </div>
        </div>
      </main>

      <Footer />

      {game.status.isComplete && (
        <Modal
          message={
            game.status.winner ? `${game.status.winner.name} wins!` : `Tie!`
          }
          onClick={() => resetGame(false)}
        />
      )}
    </>
  )
}

export default App
