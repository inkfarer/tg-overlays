// Scene switching

// Filters from https://codepen.io/sosuke/pen/Pjoqqp
const accentColors = {
	blue: {
		colorA: '#3E0099',
		colorB: '#2E0073',
		filter: 'invert(20%) sepia(90%) saturate(5356%) hue-rotate(263deg) brightness(58%) contrast(126%)'
	},
	orange: {
		colorA: '#EB8258',
		colorB: '#C46C49',
		filter: 'invert(59%) sepia(84%) saturate(592%) hue-rotate(323deg) brightness(98%) contrast(88%)'
	},
	red: {
		colorA: '#D64550',
		colorB: '#B03842',
		filter: 'invert(45%) sepia(33%) saturate(5064%) hue-rotate(328deg) brightness(86%) contrast(94%)'
	}
};

const currentBreakScene = nodecg.Replicant('currentBreakScene', 'ipl-overlay-controls');

currentBreakScene.on('change', (newValue, oldValue) => {
	let delay = 0;
	let stagesAnimLen = 0;

	if (oldValue === 'maps') {
		delay = 0.5;
	}

	switch (newValue) {
		case 'mainScene':
			stagesAnimLen = toggleStages(false);
			if (oldValue === 'maps') {
				delay = delay + stagesAnimLen;
			}
			toggleMainScene(true, delay);
			toggleNextUp(false);
			setAccentColor(accentColors.blue, 0.5);
			return;
		case 'nextUp':
			stagesAnimLen = toggleStages(false);
			if (oldValue === 'maps') {
				delay = delay + stagesAnimLen;
			}
			toggleMainScene(false);
			toggleNextUp(true, delay);
			setAccentColor(accentColors.orange, 0.5);
			return;
		case 'maps':
			toggleMainScene(false);
			toggleNextUp(false);
			toggleStages(true);
			setAccentColor(accentColors.red, '#B03842');
	}
});

function setAccentColor(clr, delay = 0) {
	gsap.to('.logoAccent', {duration: 1.5, filter: clr.filter, delay: delay});
	gsap.to(':root', {duration: 1.5, '--bgColor1': clr.colorA, '--bgColor2': clr.colorB, delay: delay});
}

function toggleMainScene(show, delay = 0) {
	let ease = 'power2.inOut';
	let opacity = show ? 1 : 0;
	let styleYTo = show ? 0 : 150;
	let styleYFrom = show ? -150 : 0;
	gsap.fromTo('.mainScene', {y: styleYFrom}, {duration: 0.5, opacity: opacity, delay: delay, y: styleYTo, ease: ease});
}

function toggleStages(show, delay = 0) {
	let opacity = show ? 1 : 0;
	let styleYTo = show ? 0 : 150;
	let styleYFrom = show ? -150 : 0;

	gsap.fromTo('.sceneStages', {y: styleYFrom}, {duration: 0.5, ease: 'power2.inOut', opacity: opacity, delay: delay, y: styleYTo})
}

function toggleNextUp(show, delay = 0) {
	let ease = 'power2.inOut';
	let opacity = show ? 1 : 0;
	let styleYTo = show ? 0 : 150;
	let styleYFrom = show ? -150 : 0;
	gsap.fromTo('.sceneTeams', {y: styleYFrom}, {duration: 0.5, opacity: opacity, delay: delay, y: styleYTo, ease: ease});
	if (show) {
		let teamAPlayers = document.querySelectorAll('.nextTeamAPlayer');
		let teamBPlayers = document.querySelectorAll('.nextTeamBPlayer');

		for (let i = 0; i < teamAPlayers.length; i++) {
			element = teamAPlayers[i];

			element.style.opacity = '0';
			gsap.to(element, {opacity: 1, duration: 0.25, delay: (i * 0.05) + (delay * 1.2)});
		};

		for (let j = 0; j < teamBPlayers.length; j++) {
			element = teamBPlayers[j];

			element.style.opacity = '0';
			gsap.to(element, {opacity: 1, duration: 0.25, delay: (j * 0.05) + (delay * 1.2)});
		};
	}
}

// Informative texts on main scene

function measureText(text, fontFamily, fontSize, maxWidth, useInnerHTML = false) {
	const measurer = document.createElement('div');
	measurer.classList.add('measurer');
	if (useInnerHTML) {
		measurer.innerHTML = text;
	} else {
		measurer.innerText = text;
	}
	measurer.style.fontFamily = fontFamily;
	measurer.style.fontSize = fontSize;

	document.body.appendChild(measurer);
	let width = measurer.getBoundingClientRect().width;
	measurer.parentNode.removeChild(measurer);
	if (width > maxWidth) { return maxWidth; }
	else { return width; }
}

const breakMainTextProps = {
	fontFamily: "'Raleway', 'Kosugi Maru', 'Roboto'",
	fontSize: '42px',
	maxWidth: 850
}

function setMainSceneText(text, elem, hasIcon = true, useInnerHTML = false) {
	let textWidth = measureText(text, breakMainTextProps.fontFamily, breakMainTextProps.fontSize, breakMainTextProps.maxWidth, useInnerHTML) + 20;

	let textElem = elem.querySelector('fitted-text');
	let bgElem = elem.querySelector('div.infoBoxBG');
	let bgWidth = hasIcon ? textWidth + 70 : textWidth;

	if (textElem.getAttribute('text') == text) return;

	let textTL = gsap.timeline();

	textTL.to(textElem, {duration: 0.5, opacity: 0, onComplete: function() {
		textElem.setAttribute('text', text);
	}});
	textTL.to(bgElem, {duration: 0.5, width: textWidth, ease: 'power2.inOut'}, 'a');
	textTL.to(elem, {duration: 0.5, width: bgWidth, ease: 'power2.inOut'}, 'a');
	textTL.to(textElem, {duration: 0.5, opacity: 1});
}

const mainFlavorText = nodecg.Replicant('mainFlavorText', 'ipl-overlay-controls', { defaultValue: 'Be right back!' });

mainFlavorText.on('change', newValue => {
	setMainSceneText(newValue, document.querySelector('#breakFlavorText'), false);
});

const casterNames = nodecg.Replicant('casterNames', 'ipl-overlay-controls', { defaultValue: "We don't know." });

casterNames.on('change', newValue => {
	let finalElem = newValue.replace(/\[\[/g, '<span class="pronoun">').replace(/\]\]/g, '</span>');
	setMainSceneText(finalElem, document.querySelector('#breakCasters'), true, true);
});

const nowPlaying = nodecg.Replicant('nowPlaying', 'ipl-overlay-controls');
const nowPlayingManual = nodecg.Replicant('nowPlayingManual', 'ipl-overlay-controls', {
    defaultValue: {
        artist: '',
        song: ''
    }
});
const mSongEnabled = nodecg.Replicant('mSongEnabled', 'ipl-overlay-controls', {defaultValue: false});

function checkStringEmptyOrUndef(string) {
	string = String(string);
	return (string === 'undefined' || string === '');
}

function getSongNameString(rep) {
	if (checkStringEmptyOrUndef(rep.artist) && checkStringEmptyOrUndef(rep.song)) {return 'No song is playing.'}

	if (checkStringEmptyOrUndef(rep.artist)) { return rep.song; }
	else if (checkStringEmptyOrUndef(rep.song)) { return rep.artist; }

	return rep.artist + ' - ' + rep.song;
}

NodeCG.waitForReplicants(nowPlaying, nowPlayingManual, mSongEnabled).then(() => {
	nowPlaying.on('change', newValue => {
		if (!mSongEnabled.value) {
			setMainSceneText(getSongNameString(newValue), document.querySelector('#breakMusic'));
		}
	});
	mSongEnabled.on('change', newValue => {
		var value;

		if (newValue) { value = nowPlayingManual.value; }
		else { value = nowPlaying.value; }

		setMainSceneText(getSongNameString(value), document.querySelector('#breakMusic'));
	});
	nowPlayingManual.on('change', newValue => {
		if (mSongEnabled.value) {
			setMainSceneText(getSongNameString(newValue), document.querySelector('#breakMusic'));
		}
	});
});

NodeCG.waitForReplicants(nowPlaying, nowPlayingManual, mSongEnabled).then(() => {
	nowPlaying.on('change', newValue => {
		if (!mSongEnabled.value) {

		}
	});
	mSongEnabled.on('change', newValue => {
		var value;

		if (newValue) { value = nowPlayingManual.value; }
		else { value = nowPlaying.value; }


	});
	nowPlayingManual.on('change', newValue => {
		if (mSongEnabled.value) {

		}
	});
});

const nextStageTime = nodecg.Replicant('nextStageTime', 'ipl-overlay-controls', {defaultValue: {
    hour: 0,
    minute: 0,
    day: 1,
    month: 0
}});

var nextStageInterval = setInterval(() => {
	const now = new Date();
	const diff = new Date(nextStageTimeObj - now);
	const diffMinutes = Math.ceil(diff / (1000 * 60));
	if (lastDiff !== diffMinutes) {
		lastDiff = diffMinutes;
		var newText;
		if (diffMinutes < 1) {
			newText = 'Next round begins soon!';
		} else if (diffMinutes == 1) {
			newText = `Next round begins in ~${diffMinutes} minute...`;
		} else {
			newText = `Next round begins in ~${diffMinutes} minutes...`;
		}
		setMainSceneText(newText, document.querySelector('#breakTimer'));
	}
}, 1000);
var lastDiff;
var nextStageTimeObj;
nextStageTime.on('change', newValue => {
	time = new Date();
	time.setDate(newValue.day);
	time.setHours(newValue.hour, newValue.minute, 0);
	time.setMonth(newValue.month);

	nextStageTimeObj = time;
});

function getGridRows(showTimer, showMusic) {
	let gridStyle = '2fr 1fr 1fr';

	if (showTimer) {
		gridStyle += ' 1fr';
	} else {
		gridStyle += ' 0fr';
	}

	if (showMusic) {
		gridStyle += ' 1fr';
	} else {
		gridStyle += ' 0fr';
	}

	return gridStyle;
}

const NSTimerShown = nodecg.Replicant('NSTimerShown', 'ipl-overlay-controls', {defaultValue: false});
const musicShown = nodecg.Replicant('musicShown', 'ipl-overlay-controls', { defaultValue: true });

function animToggleInfo(showTimer, showMusic, infoElem, elemShown) {
	let gridStyle = getGridRows(showTimer, showMusic), gridDelay, elemOpacity, elemDelay;
	if (elemShown) {
		elemOpacity = 1;
		elemDelay = 0.4;
		gridDelay = 0;
	} else {
		elemOpacity = 0;
		elemDelay = 0;
		gridDelay = 0.4;
	}

	gsap.to(infoElem, {duration: 0.5, opacity: elemOpacity, delay: elemDelay, ease: 'power2.inOut'});
	gsap.to('.mainSceneGrid', {duration: 0.5, gridTemplateRows: gridStyle, ease: 'power2.inOut', delay: gridDelay});
}

NodeCG.waitForReplicants(NSTimerShown, musicShown).then(() => {
	NSTimerShown.on('change', newValue => {
		animToggleInfo(newValue, musicShown.value, '#breakTimer', newValue);
	});

	musicShown.on('change', newValue => {
		animToggleInfo(NSTimerShown.value, newValue, '#breakMusic', newValue);
	});
});


// teams

const nextTeams = nodecg.Replicant('nextTeams', 'ipl-overlay-controls', {defaultValue: {
	teamAInfo: {
		name: "Placeholder Team 1",
		players: [
			{name:"You should fix this before going live."}
		]
	},
	teamBInfo: {
		name: "Placeholder Team 2",
		players: [
			{name:"You should fix this before going live."}
		]
	}
}});

nextTeams.on('change', newValue => {
	nextTeamAName.setAttribute('text', newValue.teamAInfo.name);
	nextTeamBName.setAttribute('text', newValue.teamBInfo.name);

	teamAplayersBG.innerHTML = '';
	teamBplayersBG.innerHTML = '';

	newValue.teamAInfo.players.forEach(player => {
		const elem = createNextTeamPlayerElem(player.name, 'right', 'a');
		teamAplayersBG.appendChild(elem);
	});

	newValue.teamBInfo.players.forEach(player => {
		const elem = createNextTeamPlayerElem(player.name, 'left', 'b');
		teamBplayersBG.appendChild(elem);
	});
});

function createNextTeamPlayerElem(name, align, team) {
	const elem = document.createElement('fitted-text');
	elem.setAttribute('text', name);
	elem.setAttribute('max-width', '435');
	elem.setAttribute('align', align);
	if (team === 'a') {
		elem.classList.add('nextTeamAPlayer');
	} else {
		elem.classList.add('nextTeamBPlayer');
	}

	return elem;
}

// Stages

const mapNameToImagePath = {"Ancho-V Games": "S2_Stage_Ancho-V_Games.png",
"Arowana Mall":"S2_Stage_Arowana_Mall.png",
"Blackbelly Skatepark":"S2_Stage_Blackbelly_Skatepark.png",
"Camp Triggerfish":"S2_Stage_Camp_Triggerfish.png",
"Goby Arena":"S2_Stage_Goby_Arena.png",
"Humpback Pump Track":"S2_Stage_Humpback_Pump_Track.png",
"Inkblot Art Academy":"S2_Stage_Inkblot_Art_Academy.png",
"Kelp Dome":"S2_Stage_Kelp_Dome.png",
"MakoMart":"S2_Stage_MakoMart.png",
"Manta Maria":"S2_Stage_Manta_Maria.png",
"Moray Towers":"S2_Stage_Moray_Towers.png",
"Musselforge Fitness":"S2_Stage_Musselforge_Fitness.png",
"New Albacore Hotel":"S2_Stage_New_Albacore_Hotel.png",
"Piranha Pit":"S2_Stage_Piranha_Pit.png",
"Port Mackerel":"S2_Stage_Port_Mackerel.png",
"Shellendorf Institute":"S2_Stage_Shellendorf_Institute.png",
"Shifty Station":"S2_Stage_Shifty_Station.png",
"Snapper Canal":"S2_Stage_Snapper_Canal.png",
"Starfish Mainstage":"S2_Stage_Starfish_Mainstage.png",
"Sturgeon Shipyard":"S2_Stage_Sturgeon_Shipyard.png",
"The Reef":"S2_Stage_The_Reef.png",
"Wahoo World":"S2_Stage_Wahoo_World.png",
"Walleye Warehouse":"S2_Stage_Walleye_Warehouse.png",
"Skipper Pavilion":"S2_Stage_Skipper_Pavilion.png",
"Unknown Map":"unnamed-unknown-map.png"};

const maplists = nodecg.Replicant('maplists', 'ipl-overlay-controls', {
    defaultValue: [
        [
            { id: 0, name: "Default map list" },
            { map: "Ancho-V Games", mode: "Clam Blitz" },
            { map: "Ancho-V Games", mode: "Tower Control" },
            { map: "Wahoo World", mode: "Rainmaker" }
        ]
    ]
});

const currentMaplistID = nodecg.Replicant('currentMaplistID', 'ipl-overlay-controls', { defaultValue: '0' });

const mapWinners = nodecg.Replicant('mapWinners', 'ipl-overlay-controls', { defaultValue: [0, 0, 0, 0, 0, 0, 0] });

const SBData = nodecg.Replicant('SBData', 'ipl-overlay-controls', {defaultValue: {
	flavorText: 'Flavor Text',
	teamAInfo: {
		name: "Placeholder Team 1",
		players: [
			{name:"You should fix this before going live."}
		]
	},
	teamAColor: 'Green',
	teamBInfo: {
		name: "Placeholder Team 2",
		players: [
			{name:"You should fix this before going live."}
		]
	},
	teamBcolor: 'Purple'
}});

function createMapListElems(maplist) {
	let stagesGrid = document.querySelector('.stagesGrid');
	gsap.to(stagesGrid, {duration: 0.5, opacity: 0, onComplete: function() {
		stagesGrid.innerHTML = '';
		stagesGrid.style.gridTemplateColumns = `repeat(${maplist.length - 1}, 1fr)`;

		let mapsHTML = '';
		let elemWidth = '260';
		let fontSize = '2em';
		let winnerFontSize = '1.7em';

		if (maplist.length === 4) {
			elemWidth = '380';
			stagesGrid.style.width = '1200px';
			winnerFontSize = '2em';
		} else if (maplist.length === 6) {
			elemWidth = '260';
			stagesGrid.style.width = '1400px';
			fontSize = '1.9em;'
			winnerFontSize = '1.9em';
		} else if (maplist.length === 8) {
			elemWidth = '190';
			stagesGrid.style.width = '1600px';
			fontSize = '1.75em';
		}

		for (let i = 1; i < maplist.length; i++) {
			const element = maplist[i];
			let elem = `
			<div class="stageElem">
				<div class="stageImage" style="background-image: url('img/stages/${mapNameToImagePath[element.map]}');">
					<div class="stageWinner" id="stageWinner_${i}" style="opacity: 0; font-size: ${winnerFontSize}"></div>
				</div>
				<div class="stageInfo">
					<div class="stageMode">
						<fitted-text text="${element.mode}" max-width="${elemWidth}" align="center"></fitted-text>
					</div>
					<div class="stageName" style="font-size: ${fontSize}">${element.map}</div>
				</div>
			</div>`

			mapsHTML += elem;
		}

		stagesGrid.innerHTML = mapsHTML;
		setWinners(mapWinners.value)
	}});

	gsap.to(stagesGrid, {duration: 0.5, opacity: 1, delay: 0.5});
}

// returns true if there is a difference
function compareMapLists(val1, val2) {
	if (val1[0].id !== val2[0].id || val1[0].name !== val2[0].name) return true;
	if (val1.length !== val2.length) return true;
	for (let i = 1; i < val1.length; i++) {
		if (val1[i].map !== val2[i].map || val1[i].mode !== val2[i].mode) return true;
	}
	return false;
}

NodeCG.waitForReplicants(maplists, currentMaplistID, mapWinners).then(() => {
	currentMaplistID.on('change', newValue => {
		let maplist = maplists.value.filter(list => list[0].id == newValue)[0];

		createMapListElems(maplist);
	});

	maplists.on('change', (newValue, oldValue) => {
		if (!oldValue) return;
		let newCurrentList = newValue.filter(list => list[0].id == currentMaplistID.value)[0];
		let oldCurrentList = oldValue.filter(list => list[0].id == currentMaplistID.value)[0];

		if (compareMapLists(newCurrentList, oldCurrentList)) {
			createMapListElems(newCurrentList);
		}
	});
});

window.addEventListener('load', () => {
	NodeCG.waitForReplicants(mapWinners, SBData).then(() => {
		mapWinners.on('change', (newValue, oldValue) => {
			setWinners(newValue);
		});

		SBData.on('change', newValue => {
			setWinners(mapWinners.value);

			document.querySelector('#teamAName').setAttribute('text', newValue.teamAInfo.name);
			document.querySelector('#teamBName').setAttribute('text', newValue.teamBInfo.name);
		});
	});
});

function setWinners(val) {
	for (let i = 0; i < val.length; i++) {
		const element = val[i];
		if (element === 0) {
			setWinner(i+1, '', false);
		} else if (element === 1) {
			setWinner(i+1, SBData.value.teamAInfo.name, true);
		} else {
			setWinner(i+1, SBData.value.teamBInfo.name, true);
		}
	}
}

function setWinner(index, name, shown) {
	let winnerElem = document.querySelector(`#stageWinner_${index}`);
	if (!winnerElem) return;
	let opacity;

	if (shown) { opacity = 1; }
	else { opacity = 0 };

	if (shown) {
		winnerElem.innerText = name;
	}

	gsap.to(winnerElem, {opacity: opacity, duration: 0.5});
}

// Scoreboard on maps page

const teamScores = nodecg.Replicant('teamScores', 'ipl-overlay-controls', {defaultValue: {
    teamA: 0,
    teamB: 0
}});

teamScores.on('change', newValue => {
	document.querySelector('#teamAScore').setAttribute('text', newValue.teamA);
	document.querySelector('#teamBScore').setAttribute('text', newValue.teamB);
});

// Background anim loop

var bgTL = gsap.timeline({repeat: -1});
bgTL.fromTo('.contentBG', {y: -240}, {duration: 5, ease: Power0.easeNone, y: -480});
