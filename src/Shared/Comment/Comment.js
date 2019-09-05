/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './Comment.css';
import { database } from '../../firebase'
import { Link } from 'react-router-dom';

function Comment(props) {
  const [isMoreButton, setIsMoreButton] = useState(props.text.length > 100);

  const [isEdit, setIsEdit] = useState(false);
  const [newComment, setNewComment] = useState(props.text);
  const [error, setError] = useState(false);

  useEffect(() => {
    setNewComment(props.text);

    return () => {
      props.handleIsEditing(false);
      setIsEdit(false);
    }
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
    props.handleIsEditing(true);
  }

  function handleSave(e) {
    e.preventDefault();

    if (!newComment) {
      setError(true);
      return;
    }

    database.ref(`posts/${props.postId}/comments/${props.id}`).update({
      text: newComment
    });

    setIsEdit(false);
    props.handleIsEditing(false);
  }

  function handleCancel() {
    setNewComment(props.text);
    setError(false);
    setIsEdit(false);
    props.handleIsEditing(false);
  }

  let options;

  if (props.activeUser === props.user) {
    options = (
      <>
        <button className='edit-button' onClick={() => handleEdit()}>✎</button>
        <button onClick={() => handleDelete()}>✘</button>
      </>
    );
  }
  else if (props.postAuthor === props.activeUser) {
    options = (
      <>
        <button onClick={() => handleDelete()}>✘</button>
      </>
    );
  }
  else {
    options = null;
  }

  if (isEdit) {
    return (
      <li id='edit'>
        <form>
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
            <input
              type='submit'
              value='Save'
              className='save-button'
              onClick={(e) => handleSave(e)}
            />
            <button className='cancel-button' onClick={handleCancel}>
              Cancel
        </button>
          </div>
        </form>
      </li>
    );
  }

  const text = isMoreButton ? props.text.slice(0, 100) + '... ' : props.text;

  return (
    <li className='comment'>
      <div>
        <Link to={`/${props.user}`}>{props.user}</Link>
        <span>
          {text}
          {
            isMoreButton &&
            <button
              className='more-button'
              onClick={() => setIsMoreButton(false)}>
              more
            </button>
          }
        </span>

      </div>
      <div className='options-wrapper'>
        {options}
      </div>
    </li >
  );
}

export default Comment;