import React, { useState, useEffect } from 'react';
import './Comment.css';
import { database } from '../../firebase'
import { Link } from 'react-router-dom';

function Comment(props) {
  const [isEdit, setIsEdit] = useState(false);
  const [newComment, setNewComment] = useState(props.text);
  const [error, setError] = useState(false);

  useEffect(() => {
    setNewComment(props.text);
  }, [props.text]);

  function handleChange(e) {
    setNewComment(e.target.value);
    setError(false);
  }

  function handleDelete() {
    database.ref(`posts/${props.postId}/comments/${props.id}`).remove();
  }

  function handleEdit() {
    if (props.isEditing) return;

    setIsEdit(true);
    props.handleIsEditing();
  }

  function handleSave() {
    if (!newComment) {
      setError(true);
      return;
    }

    database.ref(`posts/${props.postId}/comments/${props.id}`).update({
      text: newComment
    });

    setIsEdit(false);
    props.handleIsEditing();
  }

  function handleCancel() {
    setNewComment(props.text);
    setError(false);
    setIsEdit(false);
    props.handleIsEditing();
  }

  let options;

  if (props.activeUser === props.user) {
    options = (
      <button>
        Options
         <ul className='submenu'>
          <li onClick={() => handleEdit()}>
            <span>Edit</span>
          </li>
          <li onClick={() => handleDelete()}>
            <span>Delete</span>
          </li>
        </ul>
      </button>
    );
  }
  else if (props.postAuthor === props.activeUser) {
    options = (
      <button>
        Options
        <ul className='submenu'>
          <li onClick={() => handleDelete()}>
            <span>Delete</span>
          </li>
        </ul>
      </button>
    );
  }
  else {
    options = null;
  }

  if (isEdit) {
    return (
      <li id='edit'>
        <div className='edit-wrapper'>
          <Link to={`/${props.user}`}>{props.user}</Link>
          <input
            className={error && 'error'}
            type='text'
            value={newComment}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div className='buttons-wrapper'>
          <button onClick={handleSave}>
            Save
          </button>
          <button onClick={handleCancel}>
            Cancel
        </button>
        </div>
      </li>
    );
  }

  return (
    <li className='comment'>
      <div>
        <Link to={`/${props.user}`}>{props.user}</Link>
        <span>{props.text}</span>
      </div>
      <div className='options-wrapper'>
        {options}
      </div>
    </li >
  );
}

export default Comment;