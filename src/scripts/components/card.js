const getTemplate = () => { 
  return document 
    .getElementById("card-template") 
    .content.querySelector(".card") 
    .cloneNode(true); 
}; 

export const createCardElement = ( 
  data, 
  { onPreviewPicture, onLikeCard, onDeleteCard }, 
  userId 
) => { 
  const cardElement = getTemplate(); 
  const likeButton = cardElement.querySelector(".card__like-button"); 
  const likeCount = cardElement.querySelector(".card__like-count"); 
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete"); 
  const cardImage = cardElement.querySelector(".card__image"); 

  cardImage.src = data.link; 
  cardImage.alt = data.name; 
  cardElement.querySelector(".card__title").textContent = data.name; 

  // Счётчик лайков 
  likeCount.textContent = data.likes.length; 

  // Начальное состояние лайка 
  const isLiked = data.likes.some((user) => user._id === userId); 
  if (isLiked) { 
    likeButton.classList.add("card__like-button_is-active"); 
  } 

  // Скрываем кнопку удаления для чужих карточек 
  if (data.owner._id !== userId) { 
    deleteButton.remove(); 
  } else { 
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id)); 
  } 

  likeButton.addEventListener("click", () => { 
    onLikeCard(likeButton, likeCount, data._id); 
  }); 

  cardImage.addEventListener("click", () => { 
    onPreviewPicture({ name: data.name, link: data.link }); 
  }); 

  return cardElement; 
}; 

// Новый метод для переключения лайка и обновления счетчика в DOM
export const updateLikeStatus = (likeButton, likeCountElement, updatedLikesArray) => {
  likeButton.classList.toggle("card__like-button_is-active"); 
  likeCountElement.textContent = updatedLikesArray.length; 
};

// Новый метод для удаления элемента карточки из DOM
export const removeCardElement = (cardElement) => {
  cardElement.remove();
};