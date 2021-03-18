import axios from 'axios'
import React, { useReducer, useState } from 'react'

const initialState = {
    error: null,
    connection: null,
}

function connectionReducer(state, action) {
    switch (action.type) {
        case 'SUCCESS': {
            return {
                error: null,
                connection: action.connection,
            }
        }
        case 'ERROR': {
            return {
                error: action.error,
                connection: null,
            }
        }
        default: {
            return state
        }
    }
}

export default function Fetch({ url }) {
    const [{ error, connection }, dispatch] = useReducer(
        connectionReducer,
        initialState
    )
    const [buttonClicked, setButtonClicked] = useState(false)

    const fetchConnection = async (url) =>
        axios
            .get(url)
            .then((response) => {
                const { data } = response
                const { connection } = data
                dispatch({ type: 'SUCCESS', connection })
                setButtonClicked(true)
            })
            .catch((error) => {
                dispatch({ type: 'ERROR', error })
            })

    const buttonText = buttonClicked ? 'Ok' : 'Connection Established Successfully'

    return (
        <div>
            <button onClick={() => fetchConnection(url)} disabled={buttonClicked}>
                {buttonText}
            </button>
            {connection && <h1>{connection}</h1>}
            {error && <p role="alert">Oops, failed to fetch!</p>}
        </div>
    )
}