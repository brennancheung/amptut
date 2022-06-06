import React, { useState, useEffect } from 'react'
import { Amplify, API } from 'aws-amplify'
import awsExports from './aws-exports'
import {
  Authenticator,
  Button,
  Heading,
  View,
  Card
} from '@aws-amplify/ui-react'
import { listNotes } from './graphql/queries'
import { createNote, deleteNote } from './graphql/mutations'

import '@aws-amplify/ui-react/styles.css'

Amplify.configure(awsExports)

const initialFormState = { name: '', description: '' }
const filterId = id => obj => obj.id !== id

const App = () => {
  const [notes, setNotes] = useState([])
  const [formData, setFormData] = useState(initialFormState)

  const fetchNotes = async () => {
    const data = await API.graphql({ query: listNotes })
    setNotes(data.data.listNotes.items)
  }

  const handleCreateNote = async () => {
    if (!formData.name || !formData.description) return
    await API.graphql({ query: createNote, variables: { input: formData } })
    setNotes([...notes, formData])
    setFormData(initialFormState)
  }

  const handleDeleteNote = async ({ id }) => {
    const newNotesArray = notes.filter(filterId(id))
    setNotes(newNotesArray)
    await API.graphql({ query: deleteNote, variables: { input: { id } } })
  }

  const onDeleteNote = note => handleDeleteNote(note)

  const updateField = field => e =>
    setFormData({ ...formData, [field]: e.target.value })

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <View className='App'>
          <Card>
            <Heading level={1}>Welcome {user.username}!</Heading>
          </Card>
          <h1>Notes</h1>
          <input
            onChange={updateField('name')}
            placeholder='name'
            value={formData.name}
          />
          <input
            onChange={updateField('description')}
            placeholder='description'
            value={formData.description}
          />
          <Button onClick={handleCreateNote}>Create Note</Button>

          <div style={{ marginBottom: 30 }}>
            {notes.map(note => (
              <div key={note.id || note.name}>
                <h2>{note.name}</h2>
                <p>{note.description}</p>
                <Button onClick={onDeleteNote(note)}>Delete note</Button>
              </div>
            ))}
          </div>
          <hr />

          <Button onClick={signOut}>Sign out</Button>
        </View>
      )}
    </Authenticator>
  )
}

export default App
