class Quiz {
	static messagesArray = {};
	static pageBlocks = [];
	static currentPage = 0;
	static test = false;
	constructor(json) {
		this.jsonFile = json;
		Quiz.pageBlocks = [];
		this.createQuiz();
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has('TEST')) {
			Quiz.test = true;
		}
	}

	checkQuestion() {
		const index = parseInt(this.value);
		const question = Quiz.messagesArray.questions[index];
		const answer = question.correctIndex;
		const elements = document.getElementsByName('n' + index);
		var uniqueId = question.uniqueID;

		for (let i = 0; i < elements.length; i++) {
			if (elements[i].checked) {
				if (answer - 1 === i) {
					this.style.background = "#00FF00";
					this.innerHTML = "CERTO";
					if (Quiz.test==true)this.quiz.stroreAnswer(true, uniqueId);
					return;
				}
			}
		}

		const noteElement = document.getElementById('note' + index);
		noteElement.innerHTML = question.notes;
		this.style.background = "#FF0000";
		this.innerHTML = "ERRADO";

		if (Quiz.test==true)this.quiz.stroreAnswer(false, uniqueId);



	}
	stroreAnswer(isCorrect, answerId) {
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};

		// Check if a record already exists for the answerId
		if (existingRecords.hasOwnProperty(answerId)) {
			// If a record exists, append the new correctness value to the array
			existingRecords[answerId].isCorrect.push(isCorrect);
		} else {
			// If no record exists, create a new one with an array containing the initial value
			existingRecords[answerId] = {
				isCorrect: [isCorrect],
			};
		}

		// Save the updated records back to local storage
		localStorage.setItem(parts[0], JSON.stringify(existingRecords));

		this.plotAnswers(existingRecords[answerId].isCorrect);

	}
	plotAnswers(answers) {
		const canvasDiv = document.getElementById('canvasDiv');
		canvasDiv.style.display = 'block'; // Show the canvas div
		canvasDiv.onclick = function() {
			canvasDiv.style.display = 'none';
		}

		const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const trueColor = 'green';
		const falseColor = 'red';

		const answerWidth = 30; // Width of each answer box
		const spacing = 10; // Spacing between answer boxes

		let x = 10;
		let y = 10;

		for (const answer of answers) {
			const color = answer ? trueColor : falseColor;

			ctx.fillStyle = color;
			ctx.fillRect(x, y, answerWidth, answerWidth);

			x += answerWidth + spacing;

			// Move to the next row if the canvas width is reached
			if (x + answerWidth > canvas.width) {
				x = 10;
				y += answerWidth + spacing;
			}
		}
	}

	showPage() {
		var index = parseInt(this.value);
		window.scrollTo(0, 0);

		if (index == 0) {

			index = 0;
		} else {
			index = index / 10;
		}
		for (const page of Quiz.pageBlocks) {
			page.style.display = "none";
		}
		Quiz.pageBlocks[index].style.display = "block";
		Quiz.currentPage = index;
	}
	createQuiz() {

		var numberOfUnaswered = 0;
		var questionCounter = 0;
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.quiz = this;
		ajaxRequest.onreadystatechange = function() {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array


					Quiz.messagesArray = JSON.parse(ajaxRequest.responseText);
					this.quiz.questions = Quiz.messagesArray.questions;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";

					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					for (var qindex in Quiz.messagesArray.questions) {
						var pageBlock;
						Quiz.messagesArray.questions[qindex].index = index;
						index++;
						if (questionCounter == 0) {
							pageBlock = document.createElement("div");
							pageBlock.id = "Page" + questionCounter;
							pageBlock.style.display = "block";
							let btn = document.createElement("button");
							btn.innerHTML = questionCounter;
							btn.value = questionCounter;
							btn.onclick = this.quiz.showPage;
							indexBlock.appendChild(btn);
							Quiz.pageBlocks.push(pageBlock);

						} else if (questionCounter % 10 == 0) {
							pageBlock = document.createElement("div");
							pageBlock.id = "Page" + questionCounter;
							pageBlock.style.display = "none";
							let btn = document.createElement("button");
							btn.innerHTML = questionCounter;
							btn.value = questionCounter;
							btn.onclick = this.quiz.showPage;
							indexBlock.appendChild(btn);
							Quiz.pageBlocks.push(pageBlock);
						}
						questionCounter++;

						var questionBlock = document.createElement("div");
						questionBlock.className = "questionBlock";

						var questionCard = document.createElement("div");
						questionCard.className = "questionCard";
						questionBlock.appendChild(questionCard);

						var questiontxt = document.createElement("span");
						questiontxt.className = "question";
						questiontxt.innerHTML = this.quiz.questions[qindex].index + 1 + ") " + this.quiz.questions[qindex].question
						questionCard.appendChild(questiontxt);

						var answers = document.createElement("div");
						answers.className = "answers";

						var noteBlock = document.createElement("div");
						noteBlock.id = "note" + this.quiz.questions[qindex].index;
						noteBlock.className = "questionImage";

						let i = 1;
						for (var key of Quiz.messagesArray.questions[qindex].answers) {

							let label = document.createElement("label");

							let input = document.createElement("input");
							input.type = "radio";
							input.value = i;
							input.name = "n" + this.quiz.questions[qindex].index;

							label.appendChild(input);
							label.innerHTML += key;

							answers.appendChild(label);
							i++;
						}

						questionCard.appendChild(answers);
						pageBlock.appendChild(questionBlock);

						if (this.quiz.questions[qindex].img) {
							var image = document.createElement("img");
							image.className = "questionImage";
							image.src = this.quiz.questions[qindex].img;
							questionBlock.appendChild(image);
						} else {

						}


						welcomeDiv.appendChild(pageBlock);

						questionCard.appendChild(noteBlock);
						if (Quiz.messagesArray.questions[qindex].correctIndex == null) {
							console.log("ERROR Q" + Quiz.messagesArray.questions[qindex].numb);
						}
						if (Quiz.messagesArray.questions[qindex].notes == null) {
							console.log("ERROR Q" + Quiz.messagesArray.questions[qindex].numb);
						}

						if (Quiz.messagesArray.questions[qindex].correctIndex == 0) {
							let notAvailble = document.createElement("div");
							notAvailble.innerHTML = "resposta Indisponivel";
							questionBlock.appendChild(notAvailble);
							console.log(Quiz.messagesArray.questions[qindex].numb);
							numberOfUnaswered++;
						} else {

							let btn = document.createElement("button");
							btn.innerHTML = "Verificar";
							btn.value = qindex;
							btn.quiz = this.quiz;
							btn.onclick = this.quiz.checkQuestion;
							questionCard.appendChild(btn);
						}
					}
					console.log("Unaswered" + numberOfUnaswered);

				} else {
					console.log("Status error: " + ajaxRequest.status);
				}
			} else {
				console.log("Ignored readyState: " + ajaxRequest.readyState);
			}
		};
		ajaxRequest.open('GET', this.jsonFile);
		ajaxRequest.send();
	}

}