
class SimulateQuiz extends  Classes([Questions,Storage])  {

	static UNANSWERED = 0;
	static CORRECT = 1;
	static INCORRECT = -0.25;
	static COUINTERTIMEOT = 60 * 60;
	static questions = new Object();
	static PER_PAGE = 10;
	static QUESTION_AMOUNT = 40;



	checkTimer(simulateQuiz) {
		var counterDiv = document.getElementById("timer");
		if (counterDiv == null) {
			window.clearTimeout(SimulateQuiz.timer);
			return;
		}
		
		counterDiv.innerHTML = new Date(simulateQuiz.timeout * 1000).toISOString().slice(11, 19);
		simulateQuiz.timeout--;
		if (simulateQuiz.timeout < 0) {
			simulateQuiz.checkQuestions();

		}
	}
	stoptimer()
	{
		this.simulateQuiz.timeout=0;
	}
	showPage() {
		window.scrollTo(0, 0);
		for (var page of this.pageBlocks) {
			page.style.display = "none";
			page.classList.remove("active");
		}
		this.simulateQuiz.currentPage = parseInt(this.value);
		
		var currentPage=this.pageBlocks[this.simulateQuiz.currentPage];


		if (document.querySelector('#qIndex button.active')) {
			document.querySelector('#qIndex button.active').classList.remove("active")
		}
		
		currentPage.style.display = "block";
		currentPage.classList.add('active')

		this.simulateQuiz.generatePagination()
		
		//document.querySelector(`#qIndex button[value="${this.value}"]`).classList.add("active")
	}

	generatePagination() {
		//var currentPage = parseInt(document.querySelector(`.page.active`).dataset.page);
		let buttons = document.querySelector('#pagination')
		buttons.innerHTML = ''

		let previousButton = document.createElement('button');
		previousButton.innerText = 'Anterior'
		previousButton.value = this.currentPage-1;
		previousButton.onclick = this.showPage;
		previousButton.pageBlocks = this.pageBlocks;
		previousButton.simulateQuiz=this;
		previousButton.disabled = this.currentPage == 0;
		buttons.append(previousButton)

		for (let i = 0 ; i < this.numberOfPages(); i++) {
			
			var pageBtn = document.createElement("button");
			pageBtn.innerText = i + 1
			pageBtn.value = i ;
			pageBtn.onclick =  this.showPage;
			pageBtn.pageBlocks = this.pageBlocks;
			pageBtn.simulateQuiz=this;
			if (this.currentPage == i ) {
				pageBtn.className = 'active';
			}
			buttons.appendChild(pageBtn);
		}

		let nextButton = document.createElement('button');
		nextButton.innerText = 'Seguinte'
		nextButton.value = this.currentPage + 1;
		nextButton.onclick = this.showPage;
		nextButton.simulateQuiz=this;
		nextButton.pageBlocks = this.pageBlocks;
		nextButton.disabled = this.currentPage == this.numberOfPages()-1;
		buttons.append(nextButton);

		let spacer = document.createElement('div')
		spacer.style.display = 'flex';
		spacer.style.flex = 1;
		buttons.append(spacer);

		let btn = document.createElement("button");
		btn.innerHTML = "Finalizar";

		btn.onclick = this.stoptimer;
		btn.simulateQuiz = this;
		btn.id = 'submitQuiz'
		buttons.appendChild(btn);
	}

	numberOfPages() {
		return this.pageBlocks.length
	}

	checkQuestions() {
		var answers = Array();
		window.clearTimeout(this.timer);
		for (var questionIndex in this.questions) {
			var elements = document.getElementsByName("n" + questionIndex);
			answers[questionIndex] = SimulateQuiz.UNANSWERED;
			var noteDiv = document.getElementById("note" + questionIndex);

			for (var i = 0; i < elements.length; i++) {

				if (elements[i].checked) {
					const correctIndex = parseInt(this.questions[questionIndex].correctIndex);
					if (correctIndex == i + 1) {
						answers[questionIndex] = SimulateQuiz.CORRECT;
						this.stroreAnswer(true, this.questions[questionIndex].uniqueID);
					} else {
						answers[questionIndex] = SimulateQuiz.INCORRECT;
						elements[i].parentElement.style.color = '#7F1D1D';
						elements[correctIndex - 1].parentElement.style.color = '#22C55E';
						this.stroreAnswer(false, this.questions[questionIndex].uniqueID);
					}

				}
				else
				{
					this.stroreAnswer(false, this.questions[questionIndex].uniqueID);
				}
			}
			if (answers[questionIndex] != SimulateQuiz.CORRECT) {
				noteDiv.innerHTML = "Resposta certa: " + this.questions[questionIndex].correctIndex;
				noteDiv.className = "incorrect";
				noteDiv.innerHTML += "<br>" + this.questions[questionIndex].notes;

				noteDiv.parentElement.parentElement.parentElement.style.boxShadow = '0px 0px 5px #7F1D1D'
				elements[parseInt(this.questions[questionIndex].correctIndex - 1)].parentElement.style.color = '#22C55E';
			}

		}
		var total = 0;
		for (var answer of answers) {
			total += answer;

		}
		var counterDiv = document.getElementById("timer");
		counterDiv.innerHTML = "Pontos:" + total + " em 40  a classificação mínima de 20 pontos";
	}

	constructor(json) {
		super();
		this.jsonFile=json;
		var numberOfUnaswered = 0;
		var questionCounter = 0;
		this.pageBlocks = []
		this.currentPage =0;
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.simulateQuiz=this;
		ajaxRequest.pageBlocks = this.pageBlocks;
		ajaxRequest.onreadystatechange = function() {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array

					var allMessagesArray = JSON.parse(ajaxRequest.responseText);
					allMessagesArray = allMessagesArray.questions;
					var randomQ = [];
					for (let i = 0; i < SimulateQuiz.QUESTION_AMOUNT; i++) {
						var questionIndex = Math.floor(Math.random() * allMessagesArray.length);
						randomQ.push(allMessagesArray[questionIndex]);
						allMessagesArray.splice(questionIndex, 1);
					}
					this.simulateQuiz.questions = randomQ;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";

					let buttons = document.createElement('div')
					buttons.id = 'pagination'


					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					for (var qindex in randomQ) {
						var pageBlock;
						randomQ[qindex].index = index;
						index++;
						if (questionCounter == 0) {
							pageBlock = document.createElement("div");
							pageBlock.className = "page active";
							pageBlock.dataset.page =  questionCounter / SimulateQuiz.PER_PAGE + 1;
							pageBlock.style.display = "block";

							this.pageBlocks.push(pageBlock);

						} else if (questionCounter % 10 == 0) {
							pageBlock = document.createElement("div");
							pageBlock.className = "page";
							pageBlock.dataset.page =  questionCounter / SimulateQuiz.PER_PAGE + 1;
							pageBlock.style.display = "none";

							this.pageBlocks.push(pageBlock);
						}
						questionCounter++;

						var questionBlock = document.createElement("div");
						questionBlock.className = "questionBlock";

						var questionCard = document.createElement("div");
						questionCard.className = "questionCard";
						questionBlock.appendChild(questionCard);

						var questiontxt = document.createElement("span");
						questiontxt.className = "question";
						questiontxt.innerHTML = index+ ") " + this.simulateQuiz.questions[qindex].question
						questionCard.appendChild(questiontxt);

						var answers = document.createElement("div");
						answers.className = "answers";

						var noteBlock = document.createElement("div");
						noteBlock.id = "note" + this.simulateQuiz.questions[qindex].index;
						noteBlock.className = "questionImage";

						let i = 1;
						for (let key of this.simulateQuiz.questions[qindex].answers) {
							let label = document.createElement("label");

							let input = document.createElement("input");
							input.type = "radio";
							input.value = i;
							input.name = "n" + this.simulateQuiz.questions[qindex].index;

							label.appendChild(input);
							label.innerHTML += key;

							answers.appendChild(label);
							i++;
						}

						questionCard.appendChild(answers);
						pageBlock.appendChild(questionBlock);

						if (this.simulateQuiz.questions[qindex].img) {
							var image = document.createElement("img");
							image.className = "questionImage";
							image.src = this.simulateQuiz.questions[qindex].img;
							questionBlock.appendChild(image);
						} else {

						}


						welcomeDiv.appendChild(pageBlock);
						

						answers.appendChild(noteBlock);
						if (this.simulateQuiz.questions[qindex].correctIndex == null) {
							console.log("ERROR Q" + this.simulateQuiz.questions[qindex].uniqueID);
						}
						if (this.simulateQuiz.questions[qindex].notes == null) {
							console.log("ERROR Q" + this.simulateQuiz.questions[qindex].uniqueID);
						}					

					}

					indexBlock.append(buttons);
					this.simulateQuiz.generatePagination();

					var timerBlock = document.createElement("div");
					timerBlock.id = "timer";
					timerBlock.textContent = '01:00:00';
					indexBlock.appendChild(timerBlock);

					console.log("Unaswered" + numberOfUnaswered);
					this.simulateQuiz.timeout = SimulateQuiz.COUINTERTIMEOT;
					window.clearTimeout(this.simulateQuiz.timer);
					this.simulateQuiz.timer = window.setInterval(this.simulateQuiz.checkTimer, 1000,this.simulateQuiz);
					

				} else {
					console.log("Status error: " + ajaxRequest.status);
				}
			} else {
				console.log("Ignored readyState: " + ajaxRequest.readyState);
			}
		};
		ajaxRequest.open('GET', json);
		ajaxRequest.send();
	}
}
