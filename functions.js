window.addEventListener('DOMContentLoaded', function () {
  const birthday = new Date('2008-10-07T00:00:00');
  const elapsedYears = document.getElementById('elapsedYears');
  const elapsedDays = document.getElementById('elapsedDays');
  const photoTriggers = Array.from(document.querySelectorAll('.photo-trigger'));
  const photoViewer = document.getElementById('photoViewer');
  const viewerImage = document.getElementById('viewerImage');
  const photoViewerCounter = document.getElementById('photoViewerCounter');
  const photoViewerContent = document.querySelector('.photo-viewer-content');
  const closePhotoViewer = document.getElementById('closePhotoViewer');
  const previousPhoto = document.getElementById('previousPhoto');
  const nextPhoto = document.getElementById('nextPhoto');
  const audio = document.getElementById('birthdayAudio');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const musicStatus = document.getElementById('musicStatus');
  const musicVolume = document.getElementById('musicVolume');
  const giftBox = document.getElementById('giftBox');
  const giftLabel = document.getElementById('giftLabel');
  const introOverlay = document.getElementById('introOverlay');
  const startCelebration = document.getElementById('startCelebration');
  const giftOverlay = document.getElementById('giftOverlay');
  const celebrationCard = document.getElementById('celebrationCard');
  const replayGift = document.getElementById('replayGift');
  const giftLockMessage = document.getElementById('giftLockMessage');
  const giftNote = document.getElementById('giftNote');
  const giftPassword = document.getElementById('giftPassword');
  const unlockGift = document.getElementById('unlockGift');
  const passwordError = document.getElementById('passwordError');
  const lockPanel = document.getElementById('lockPanel');
  const correctPassword = '0710';
  const miniGame = document.getElementById('miniGame');
  const gamePrompt = document.getElementById('gamePrompt');
  const gameStatus = document.getElementById('gameStatus');
  const typewriterBox = document.getElementById('typewriterBox');
  const typewriterText = document.getElementById('typewriterText');
  const toggleMessage = document.getElementById('toggleMessage');
  const memoryGrid = document.getElementById('memoryGrid');
  const moveCountElement = document.getElementById('moveCount');
  const resetGame = document.getElementById('resetGame');
  let isMusicOn = false;
  let musicRequestPending = false;
  let typewriterTimer = null;
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let activePhotoIndex = 0;
  let moveCount = 0;
  let touchStartX = null;
  let touchStartY = null;
  let activeMessage = '';

  function updateAgeDuration() {
    const now = new Date();
    const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
    const lastBirthday = thisYearBirthday <= now
      ? thisYearBirthday
      : new Date(now.getFullYear() - 1, birthday.getMonth(), birthday.getDate());
    const years = lastBirthday.getFullYear() - birthday.getFullYear();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const lastBirthdayUtc = Date.UTC(
      lastBirthday.getFullYear(),
      lastBirthday.getMonth(),
      lastBirthday.getDate()
    );
    const days = Math.floor((todayUtc - lastBirthdayUtc) / 86400000);

    if (elapsedYears) elapsedYears.textContent = String(Math.max(years, 0));
    if (elapsedDays) elapsedDays.textContent = String(Math.max(days, 0));
  }

  function showPhoto(index) {
    if (!viewerImage || !photoTriggers.length) return;
    activePhotoIndex = (index + photoTriggers.length) % photoTriggers.length;
    const image = photoTriggers[activePhotoIndex].querySelector('img');
    if (!image) return;
    viewerImage.src = image.src;
    viewerImage.alt = image.alt;
    if (photoViewerCounter) {
      photoViewerCounter.textContent = `${activePhotoIndex + 1} / ${photoTriggers.length}`;
    }
  }

  function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const confetti = document.createElement('div');
    confetti.className = 'confetti-burst';
    confetti.setAttribute('aria-hidden', 'true');
    const colors = ['#ff9ed5', '#f7d99a', '#a7e8ff', '#c4a7ff', '#ffffff'];

    for (let index = 0; index < 64; index += 1) {
      const piece = document.createElement('span');
      piece.style.setProperty('--x', `${Math.random() * 100}vw`);
      piece.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty('--delay', `${Math.random() * 0.45}s`);
      piece.style.setProperty('--color', colors[index % colors.length]);
      confetti.appendChild(piece);
    }

    document.body.appendChild(confetti);
    setTimeout(function () {
      confetti.remove();
    }, 2800);
  }

  function setMusicState(isPlaying, errorMessage) {
    if (!musicIcon || !musicToggle) return;
    musicIcon.textContent = errorMessage ? '⚠️' : (isPlaying ? '♫' : '🔇');
    musicToggle.setAttribute('aria-label', isPlaying ? 'كتم الموسيقى' : 'تشغيل الموسيقى');
    musicToggle.title = errorMessage || (isPlaying ? 'كتم الموسيقى' : 'تشغيل الموسيقى');
    if (musicStatus) {
      musicStatus.textContent = errorMessage || '';
      musicStatus.classList.toggle('visible', Boolean(errorMessage));
    }
  }

  async function startMusic() {
    if (!audio) {
      setMusicState(false, 'تعذر العثور على مشغل الموسيقى.');
      return false;
    }

    let playbackTimeout;
    try {
      audio.volume = 0.35;
      await Promise.race([
        audio.play(),
        new Promise(function (_, reject) {
          playbackTimeout = setTimeout(function () {
            reject(new Error('انتهت مهلة تشغيل الموسيقى'));
          }, 5000);
        })
      ]);
      isMusicOn = true;
      setMusicState(true);
      return true;
    } catch {
      audio.pause();
      isMusicOn = false;
      const errorMessage = location.protocol === 'file:'
        ? 'المتصفح يمنع تحميل الصوت عند فتح index.html مباشرة. افتحي الموقع عبر خادم محلي مثل Live Server.'
        : 'تعذر تشغيل aud.mp3. تأكدي من سلامة الملف وأنه موجود بجانب index.html.';
      setMusicState(false, errorMessage);
      return false;
    } finally {
      clearTimeout(playbackTimeout);
    }
  }

  function stopMusic() {
    if (!audio) return;
    audio.pause();
    isMusicOn = false;
    setMusicState(false);
  }

  async function toggleMusic() {
    if (!audio || musicRequestPending) return;

    if (isMusicOn && !audio.paused) {
      stopMusic();
      return;
    }

    musicRequestPending = true;
    if (musicToggle) musicToggle.disabled = true;
    try {
      await startMusic();
    } finally {
      musicRequestPending = false;
      if (musicToggle) musicToggle.disabled = false;
    }
  }

  function updateGiftState() {
    const unlocked = giftBox && giftBox.dataset.unlocked === 'true';

    if (giftBox) {
      giftBox.disabled = !unlocked;
      giftBox.setAttribute('aria-label', unlocked ? 'فتح الهدية' : 'أدخل كلمة السر');
    }

    if (giftLabel) {
      giftLabel.textContent = unlocked ? 'افتحي الهدية' : 'سووووون';
    }

    if (giftLockMessage) {
      giftLockMessage.textContent = unlocked ? 'الهدية جاهزة الآن!' : 'هممم🤔ايش الكلمة يا ترى';
      giftLockMessage.classList.toggle('is-ready', unlocked);
    }

    if (lockPanel) {
      lockPanel.style.display = unlocked ? 'none' : 'grid';
    }

    if (giftNote) {
      giftNote.classList.toggle('hidden', !unlocked);
      giftNote.style.opacity = unlocked ? '1' : '0';
    }
  }

  function unlockGiftWithPassword() {
    const entered = (giftPassword && giftPassword.value ? giftPassword.value.trim() : '').toString();

    if (entered !== correctPassword) {
      if (passwordError) {
        passwordError.textContent = 'كلمة المرور غير صحيحة';
      }
      return;
    }

    if (giftBox) {
      giftBox.dataset.unlocked = 'true';
    }

    if (passwordError) {
      passwordError.textContent = '';
    }

    if (giftPassword) {
      giftPassword.value = '';
    }

    updateGiftState();
    openGift();
  }

  function openGift() {
    if (!giftOverlay || !celebrationCard) return;
    if (giftBox && giftBox.dataset.unlocked !== 'true') return;
    document.body.classList.add('celebrating');
    giftOverlay.classList.add('hidden');
    celebrationCard.classList.remove('hidden');
    celebrationCard.classList.add('visible');
    launchConfetti();
  }

  function shuffleCards() {
    const cards = Array.from(memoryGrid ? memoryGrid.querySelectorAll('.memory-card') : []);

    const symbols = ['🩵', '🫂', '🎂'];
    const deck = [...symbols, ...symbols];
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
    }

    cards.forEach(function (card, index) {
      card.dataset.value = deck[index];
      card.textContent = '?';
      card.classList.remove('matched', 'revealed');
      card.disabled = false;
      card.setAttribute('aria-label', 'بطاقة');
    });

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
  }

  function resetMiniGame() {
    if (gameStatus) {
      gameStatus.textContent = '';
      gameStatus.classList.remove('wrong');
    }

    if (typewriterBox) {
      typewriterBox.classList.add('hidden');
    }

    if (typewriterText) {
      typewriterText.textContent = '';
    }

    activeMessage = '';
    if (typewriterBox) typewriterBox.classList.remove('expanded');
    if (toggleMessage) {
      toggleMessage.classList.add('hidden');
      toggleMessage.textContent = 'قراءة الرسالة كاملة';
      toggleMessage.setAttribute('aria-expanded', 'false');
    }

    moveCount = 0;
    if (moveCountElement) moveCountElement.textContent = 'المحاولات: 0';

    if (gamePrompt) {
      gamePrompt.textContent = 'اكتشف الأزواج المتطابقة 💞';
    }

    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }

    shuffleCards();
  }

  function typeMessage(message) {
    if (!typewriterText || !typewriterBox) return;

    typewriterText.textContent = '';
    typewriterBox.classList.remove('hidden');
    typewriterBox.classList.remove('expanded');
    activeMessage = message;
    if (toggleMessage) {
      toggleMessage.classList.remove('hidden');
      toggleMessage.textContent = 'تخطي الكتابة';
      toggleMessage.setAttribute('aria-expanded', 'false');
    }

    const characters = Array.from(message);
    let index = 0;
    if (typewriterTimer) clearInterval(typewriterTimer);

    typewriterTimer = setInterval(function () {
      typewriterText.textContent += characters[index] || '';
      index += 1;

      if (index >= characters.length) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        if (toggleMessage) toggleMessage.textContent = 'قراءة الرسالة كاملة';
      }
    }, 12);
  }

  function checkWin() {
    if (matchedPairs !== 3) return;

    if (gameStatus) {
      gameStatus.textContent = 'كفوووو عليكييي👏';
    }

    launchConfetti();

    const message = [
      'في هذا اليوم حيث تُضاء السماء بأجمل الألوان، وُلدت واحدة من أجمل النعم التي أهدتني إياها الحياة، أختي التي لم تكن يوماً مجرد أخت، بل كانت وما زالت جزءاً مني، وتوأم روحي التي أجد فيها القرب والراحة والضحكة التي لا تشبه أي ضحكة أخرى.',
      'كل عام وأنتي بألف خير حلوشة، وكل عام وأنتي بخير وسعادة وطمأنينة، ويوم ميلادك مش مجرد تاريخٍ بمرّ كل عام، يوم ميلادك يوم بتذكر في قديش أنا محظوظ لأنو الله كتبلي أنو تكوني أختي، وأنو أكبر معك وأشاركك تفاصيل حياتي، بحلوها ومرّها، بضحكاتها وأيامها الصعبة.',
      'حلا، يا أحلى أخت وأقرب روح، وجودك بحياتي اشي مستحيل أختصرو بكلمات. عشان أنتي الشخص اللي مهما اختلفت الأيام وتغيّرت الظروف، بضل مكانو ثابت بالقلب. أخت بفتخر فيها، وروح قريبة مني، وشخص بعرف أني مهما كبرت ومهما أخذتنا الحياة بطرق مختلفة، هتضلي دايماً أختي وتوأم روحي.',
      'حلا... اسم إذا نذكر، لحقتو الابتسامة بدون استئذان. فالحاء حب وحنان، واللام لطف يرافق حضورك، والألف أمان وراحة بلاقيها كل من عرفك حق المعرفة. واسمك مش مجرد اسم حلو، بلعكس هو بشبهك تماماً، بسيط وقريب من القلب، وحلو زيّك أنتي يحرباي.',
      'كبرنا مع بعض، وعشنا تفاصيل بعرفش قيمتها غيرنا، ضحكنا على أشياء يمكن ما يفهمها حدا غيرنا، وتشاركنا لحظات كتيرة هتضل محفورة في ذاكرتي مهما مرّ الوقت. ويمكن كثير أشياء ما بحكيها، ومش دايماً بعرف أعبّر عنها، بس هاد ما بيعني أنها مش موجودة، فأنتي عندي أغلى بكتير من أي كلام ممكن ينقال.',
      'أنتي أختي، بس بالنسبة إليّ أكثر من مجرد كلمة "أخت". أنتي قطعة من روحي، ووحدة من الأشخاص اللي ما بتخيل حياتي بدون وجودهم. وبتمنى مهما كبرنا وتغيّرت حياتنا، تضل علاقتنا بنفس القرب، ونضل دايماً سند لبعض، ونرجع لبعض مهما أخذتنا الدنيا بعيد.',
      'شكراً لأنكِ كنتي دايماً جزء من أيامي، ولأنو وجودك خلى للدار معنى مختلف، ولأنك كنتي وما زلتي وحدة من أحلى الأشياء اللي بملكها في هاي الحياة.',
      'في يوم ميلادك، بتمنى من الله أن يحميكي من كل اشي ممكن يأذي قلبك، وأنو يكتبلك في عامك الجديد فرحة ما تفنى ولا تنتهي، وراحة بال ما تزول، وأيام أحلى من كل ما بتتمني. بتمنى أنو تحققي كل أحلامك مهما كانت، وأنو تشوفي بحياتك كل الخير اللي بتستحقي، وأنو تضل ابتسامتك موجودة مهما مرّت عليكي الأيام.',
      'وأسأل الله أن يخليلي ياكي يا شاضومة، وأنو يجمعنا دايماً على المحبة، وأنو تضلي معي بكل مراحل العمر، من أول ذكرياتنا لآخرها.',
      'كل عام وأنتي حلوشة الحلوة، كل عام وأنتي أختي، وكل عام وأنتي توأم روحي وقطعة من قلبي.',
      'كل عام وأنتي بخير وسلام وطمأنينة، وكل عام وأنا أحمد الله أنو الي أخت زيّك.',
      'عيد ميلاد سعيد يا حلاشتي🤍🦋\nالله يحفظك ويخليك إلنا، ويكتبلك من الخير والفرح أضعاف ما بتتمني، ويجمعنا دائماً على أحلى الأيام والذكريات.',
      'بحبكِ يا اختشي، يا توأم روحي، ويا أجمل جزء من حياتي. 🤍'
    ].join('\n\n');
    typeMessage(message);
  }

  function handleMemoryCardClick(event) {
    const card = event.currentTarget;

    if (!card || lockBoard || card.disabled || card.classList.contains('matched')) return;
    if (card === firstCard) return;

    card.textContent = card.dataset.value;
    card.classList.add('revealed');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    moveCount += 1;
    if (moveCountElement) moveCountElement.textContent = `المحاولات: ${moveCount}`;

    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      firstCard.disabled = true;
      secondCard.disabled = true;
      matchedPairs += 1;
      checkWin();
      firstCard = null;
      secondCard = null;
      lockBoard = false;
      return;
    }

    if (gameStatus) {
      gameStatus.textContent = 'مش هاد جربي مرة تانية😜';
      gameStatus.classList.add('wrong');
    }

    setTimeout(function () {
      firstCard.textContent = '?';
      secondCard.textContent = '?';
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');
      firstCard = null;
      secondCard = null;
      lockBoard = false;
      if (gameStatus) {
        gameStatus.textContent = '';
        gameStatus.classList.remove('wrong');
      }
    }, 700);
  }

  function hideIntroScreen() {
    if (!introOverlay) return;
    introOverlay.classList.add('hidden');
    introOverlay.setAttribute('aria-hidden', 'true');
  }

  function resetGift() {
    if (!giftOverlay || !celebrationCard) return;
    document.body.classList.remove('celebrating');
    celebrationCard.classList.remove('visible');
    celebrationCard.classList.add('hidden');
    giftOverlay.classList.remove('hidden');
    resetMiniGame();
  }

  if (giftBox) {
    giftBox.dataset.unlocked = 'false';
    giftBox.addEventListener('click', openGift);
  }

  if (memoryGrid) {
    const cards = memoryGrid.querySelectorAll('.memory-card');
    cards.forEach(function (card) {
      card.addEventListener('click', handleMemoryCardClick);
    });
  }

  if (resetGame) resetGame.addEventListener('click', resetMiniGame);

  if (unlockGift) {
    unlockGift.addEventListener('click', unlockGiftWithPassword);
  }

  if (giftPassword) {
    giftPassword.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        unlockGiftWithPassword();
      }
    });
  }

  if (replayGift) {
    replayGift.addEventListener('click', function () {
      resetGift();
      setTimeout(function () {
        if (giftBox) giftBox.focus();
      }, 200);
    });
  }

  if (startCelebration) {
    startCelebration.addEventListener('click', function () {
      hideIntroScreen();
      toggleMusic();
    });
  }

  photoTriggers.forEach(function (trigger, index) {
    trigger.addEventListener('click', function () {
      showPhoto(index);
      if (photoViewer && !photoViewer.open) photoViewer.showModal();
    });
  });

  if (photoViewerContent) {
    photoViewerContent.addEventListener('touchstart', function (event) {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    photoViewerContent.addEventListener('touchend', function (event) {
      if (touchStartX === null || touchStartY === null) return;
      const touch = event.changedTouches[0];
      const horizontalDistance = touch.clientX - touchStartX;
      const verticalDistance = touch.clientY - touchStartY;
      if (Math.abs(horizontalDistance) > 48 && Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
        showPhoto(activePhotoIndex + (horizontalDistance < 0 ? 1 : -1));
      }
      touchStartX = null;
      touchStartY = null;
    }, { passive: true });
  }

  if (photoViewer) {
    photoViewer.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') showPhoto(activePhotoIndex + 1);
      if (event.key === 'ArrowLeft') showPhoto(activePhotoIndex - 1);
    });
  }

  if (closePhotoViewer && photoViewer) {
    closePhotoViewer.addEventListener('click', function () {
      photoViewer.close();
    });
  }

  if (previousPhoto) {
    previousPhoto.addEventListener('click', function () {
      showPhoto(activePhotoIndex - 1);
    });
  }

  if (nextPhoto) {
    nextPhoto.addEventListener('click', function () {
      showPhoto(activePhotoIndex + 1);
    });
  }

  if (toggleMessage && typewriterBox) {
    toggleMessage.addEventListener('click', function () {
      if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        typewriterText.textContent = activeMessage;
        typewriterBox.classList.add('expanded');
        toggleMessage.setAttribute('aria-expanded', 'true');
        toggleMessage.textContent = 'إخفاء جزء من الرسالة';
        return;
      }

      const expanded = typewriterBox.classList.toggle('expanded');
      toggleMessage.setAttribute('aria-expanded', String(expanded));
      toggleMessage.textContent = expanded ? 'إخفاء جزء من الرسالة' : 'قراءة الرسالة كاملة';
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', function (event) {
      event.preventDefault();
      toggleMusic();
    });
  }

  if (musicVolume && audio) {
    audio.volume = Number(musicVolume.value);
    musicVolume.addEventListener('input', function () {
      audio.volume = Number(musicVolume.value);
      if (audio.volume === 0 && isMusicOn) {
        stopMusic();
      } else if (audio.volume > 0 && isMusicOn && audio.paused) {
        startMusic();
      }
    });
  }

  updateAgeDuration();
  setInterval(updateAgeDuration, 60000);
  updateGiftState();
  setMusicState(false);
  resetGift();
});
