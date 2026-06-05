import { createCardElement, updateLikeStatus, removeCardElement } from "./components/card.js"; 
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js"; 
import { getUserInfo, getCardList, setUserInfo, updateAvatar, addCard, deleteCard, changeLikeCardStatus } from "./components/api.js"; 
import { enableValidation, clearValidation } from "./components/validation.js"; 

// Конфигурация валидации 
const validationConfig = { 
  formSelector: ".popup__form", 
  inputSelector: ".popup__input", 
  submitButtonSelector: ".popup__button", 
  inactiveButtonClass: "popup__button_disabled", 
  inputErrorClass: "popup__input_type_error", 
  errorClass: "popup__error_visible", 
}; 

// DOM узлы 
const placesWrap = document.querySelector(".places__list"); 

const profileFormModalWindow = document.querySelector(".popup_type_edit"); 
const profileForm = profileFormModalWindow.querySelector(".popup__form"); 
const profileTitleInput = profileForm.querySelector(".popup__input_type_name"); 
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description"); 

const cardFormModalWindow = document.querySelector(".popup_type_new-card"); 
const cardForm = cardFormModalWindow.querySelector(".popup__form"); 
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name"); 
const cardLinkInput = cardForm.querySelector(".popup__input_type_url"); 

const imageModalWindow = document.querySelector(".popup_type_image"); 
const imageElement = imageModalWindow.querySelector(".popup__image"); 
const imageCaption = imageModalWindow.querySelector(".popup__caption"); 

const removeCardModalWindow = document.querySelector(".popup_type_remove-card"); 
const removeCardForm = removeCardModalWindow.querySelector(".popup__form"); 
const removeCardButton = removeCardForm.querySelector(".popup__button"); 

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar"); 
const avatarForm = avatarFormModalWindow.querySelector(".popup__form"); 
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar"); 

const infoModalWindow = document.querySelector(".popup_type_info"); 
const infoTitle = infoModalWindow.querySelector(".popup__title"); 
const infoList = infoModalWindow.querySelector(".popup__info"); 
const infoSubtitle = infoModalWindow.querySelector(".popup__text"); 
const infoUserList = infoModalWindow.querySelector(".popup__list"); 

const openProfileFormButton = document.querySelector(".profile__edit-button"); 
const openCardFormButton = document.querySelector(".profile__add-button"); 
const profileTitle = document.querySelector(".profile__title"); 
const profileDescription = document.querySelector(".profile__description"); 
const profileAvatar = document.querySelector(".profile__image"); 
const logo = document.querySelector(".logo"); 

// Утилита: переключение текста кнопки во время загрузки 
const renderLoading = (button, isLoading, defaultText) => { 
  button.textContent = isLoading ? "Сохранение..." : defaultText; 
}; 

// Открытие попапа просмотра изображения 
const handlePreviewPicture = ({ name, link }) => { 
  imageElement.src = link; 
  imageElement.alt = name; 
  imageCaption.textContent = name; 
  openModalWindow(imageModalWindow); 
}; 

// Лайк карточки 
const handleLikeCard = (likeButton, likeCount, cardId) => { 
  const isLiked = likeButton.classList.contains("card__like-button_is-active"); 
  changeLikeCardStatus(cardId, isLiked) 
    .then((updatedCard) => { 
      // Вызываем метод модуля карточки для обновления лайка
      updateLikeStatus(likeButton, likeCount, updatedCard.likes); 
    }) 
    .catch((err) => console.log(err)); 
}; 

// Удаление карточки через попап подтверждения 
let cardToDelete = null; 
let cardElementToDelete = null; 

const handleDeleteCard = (cardElement, cardId) => { 
  cardToDelete = cardId; 
  cardElementToDelete = cardElement; 
  openModalWindow(removeCardModalWindow); 
}; 

removeCardForm.addEventListener("submit", (evt) => { 
  evt.preventDefault(); 
  removeCardButton.textContent = "Удаление..."; 
  deleteCard(cardToDelete) 
    .then(() => { 
      // Вызываем метод модуля карточки для удаления элемента из DOM
      removeCardElement(cardElementToDelete); 
      closeModalWindow(removeCardModalWindow); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => { 
      removeCardButton.textContent = "Да"; 
    }); 
}); 

// Обработчик формы редактирования профиля 
const handleProfileFormSubmit = (evt) => { 
  evt.preventDefault(); 
  const submitButton = profileForm.querySelector(".popup__button"); 
  renderLoading(submitButton, true, "Сохранить"); 
  setUserInfo({ 
    name: profileTitleInput.value, 
    about: profileDescriptionInput.value, 
  }) 
    .then((userData) => { 
      profileTitle.textContent = userData.name; 
      profileDescription.textContent = userData.about; 
      closeModalWindow(profileFormModalWindow); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => renderLoading(submitButton, false, "Сохранить")); 
}; 

// Обработчик формы обновления аватара 
const handleAvatarFormSubmit = (evt) => { 
  evt.preventDefault(); 
  const submitButton = avatarForm.querySelector(".popup__button"); 
  renderLoading(submitButton, true, "Сохранить"); 
  updateAvatar({ avatar: avatarInput.value }) 
    .then((userData) => { 
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`; 
      closeModalWindow(avatarFormModalWindow); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => renderLoading(submitButton, false, "Сохранить")); 
}; 

// Обработчик формы добавления карточки 
const handleCardFormSubmit = (evt) => { 
  evt.preventDefault(); 
  const submitButton = cardForm.querySelector(".popup__button"); 
  submitButton.textContent = "Создание..."; 
  addCard({ name: cardNameInput.value, link: cardLinkInput.value }) 
    .then((newCard) => { 
      placesWrap.prepend( 
        createCardElement( 
          newCard, 
          { 
            onPreviewPicture: handlePreviewPicture, 
            onLikeCard: handleLikeCard, 
            onDeleteCard: handleDeleteCard, 
          }, 
          currentUserId 
        ) 
      ); 
      closeModalWindow(cardFormModalWindow); 
      cardForm.reset(); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => { 
      submitButton.textContent = "Создать"; 
    }); 
}; 

// Event listeners форм 
profileForm.addEventListener("submit", handleProfileFormSubmit); 
cardForm.addEventListener("submit", handleCardFormSubmit); 
avatarForm.addEventListener("submit", handleAvatarFormSubmit); 

// Открытие попапа редактирования профиля 
openProfileFormButton.addEventListener("click", () => { 
  profileTitleInput.value = profileTitle.textContent; 
  profileDescriptionInput.value = profileDescription.textContent; 
  clearValidation(profileForm, validationConfig); 
  openModalWindow(profileFormModalWindow); 
}); 

// Открытие попапа обновления аватара 
profileAvatar.addEventListener("click", () => { 
  avatarForm.reset(); 
  clearValidation(avatarForm, validationConfig); 
  openModalWindow(avatarFormModalWindow); 
}); 

// Открытие попапа добавления карточки 
openCardFormButton.addEventListener("click", () => { 
  cardForm.reset(); 
  clearValidation(cardForm, validationConfig); 
  openModalWindow(cardFormModalWindow); 
}); 

// Закрытие всех попапов 
const allPopups = document.querySelectorAll(".popup"); 
allPopups.forEach((popup) => { 
  setCloseModalWindowEventListeners(popup); 
}); 

// Статистика пользователей (Вариант 2) 
const infoDefinitionTemplate = document.getElementById("popup-info-definition-template"); 
const infoUserPreviewTemplate = document.getElementById("popup-info-user-preview-template"); 

const formatDate = (date) => 
  date.toLocaleDateString("ru-RU", { 
    year: "numeric", 
    month: "long", 
    day: "numeric", 
  }); 

const createInfoString = (term, description) => { 
  const item = infoDefinitionTemplate.content.cloneNode(true); 
  item.querySelector(".popup__info-term").textContent = term; 
  item.querySelector(".popup__info-description").textContent = description; 
  return item; 
}; 

const handleLogoClick = () => { 
  getCardList() 
    .then((cards) => { 
      const usersMap = {}; 
      cards.forEach((card) => { 
        const ownerId = card.owner._id; 
        if (!usersMap[ownerId]) { 
          usersMap[ownerId] = { name: card.owner.name, count: 0 }; 
        } 
        usersMap[ownerId].count += 1; 
      }); 

      const users = Object.values(usersMap); 
      const maxCardsFromOne = Math.max(...users.map((u) => u.count)); 

      infoList.innerHTML = ""; 
      infoUserList.innerHTML = ""; 

      infoTitle.textContent = "Статистика пользователей"; 
      infoSubtitle.textContent = "Все пользователи:"; 

      infoList.append(createInfoString("Всего карточек:", cards.length)); 
      infoList.append( 
        createInfoString("Первая создана:", formatDate(new Date(cards[cards.length - 1].createdAt))) 
      ); 
      infoList.append( 
        createInfoString("Последняя создана:", formatDate(new Date(cards[0].createdAt))) 
      ); 
      infoList.append(createInfoString("Всего пользователей:", users.length)); 
      infoList.append(createInfoString("Максимум карточек от одного:", maxCardsFromOne)); 

      users.forEach((user) => { 
        const item = infoUserPreviewTemplate.content.cloneNode(true); 
        item.querySelector(".popup__list-item").textContent = user.name; 
        infoUserList.append(item); 
      }); 

      openModalWindow(infoModalWindow); 
    }) 
    .catch((err) => console.log(err)); 
}; 

logo.addEventListener("click", handleLogoClick); 

// Включение валидации 
enableValidation(validationConfig); 

// Загрузка данных с сервера 
let currentUserId = null; 

Promise.all([getCardList(), getUserInfo()]) 
  .then(([cards, userData]) => { 
    currentUserId = userData._id; 

    // Данные профиля 
    profileTitle.textContent = userData.name; 
    profileDescription.textContent = userData.about; 
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`; 

    // Карточки 
    cards.forEach((card) => { 
      placesWrap.append( 
        createCardElement( 
          card, 
          { 
            onPreviewPicture: handlePreviewPicture, 
            onLikeCard: handleLikeCard, 
            onDeleteCard: handleDeleteCard, 
          }, 
          currentUserId 
        ) 
      ); 
    }); 
  }) 
  .catch((err) => console.log(err));