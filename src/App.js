import React, { useState, useEffect } from "react";
import { Form, FormState, useMultistepApi, Multistep, Text } from "informed";

const splitIntoSingleQuestions = (questionsList) => {
	const flattenedList = questionsList.reduce((flattened, question) => {
		flattened.push([question]);
		if (question.subQuestions) {
			flattened.push(...splitIntoSingleQuestions(question.subQuestions));
		}
		return flattened;
	}, []);
	return flattenedList;
};

const splitIntoTopLevelGroupsOfSize = (questionsList, size) => {
	console.log(`Calling splitIntoTopLevelGroupsOfSize with`, {
		questionsList,
		size,
	});
	const splitQuestions = [];
	let currentGroup = [];
	for (let i = 0; i < questionsList.length; i++) {
		const currentQuestion = questionsList[i];
		currentGroup.push(currentQuestion);

		// potentially start a new list
		if (currentGroup.length === size || i === questionsList.length - 1) {
			splitQuestions.push([...currentGroup]);
			currentGroup = [];
		}
	}
	return splitQuestions;
};

const DisplayQuestionInstance = ({ questionInstance, nextStep }) => {
	return (
		<>
			<Text
				field={questionInstance.name}
				label={questionInstance.prompt}
			/>
			<br />
			{questionInstance.subQuestions
				? questionInstance.subQuestions.map((subq) => (
						<Step
							questionInstances={[subq]}
							step={"subq" + subq.name}
							backName="step_0"
							nextName={nextStep}
						/>
				  ))
				: null}
		</>
	);
};

const Step = ({ questionInstances, stepName, nextName, backName }) => {
	const { back, next } = useMultistepApi();
	const [actualNext, setActualNext] = useState(nextName);
	return (
		<Multistep.Step
			step={stepName}
			next={actualNext}
			previous={backName || null}
		>
			<pre>next: {actualNext}</pre>
			{questionInstances.map((question) => (
				<DisplayQuestionInstance questionInstance={question} />
			))}
			<br />
			<button
				type="button"
				onClick={() => {
					setActualNext("INVALID");
					setTimeout(() => {
						console.log(`Setting actual next`);
						setActualNext(nextName);
					}, 3000);
				}}
			>
				Change Next
			</button>
			{backName ? (
				<button type="button" onClick={back}>
					Back
				</button>
			) : null}
			{nextName ? (
				<button type="button" onClick={next}>
					Next
				</button>
			) : null}
		</Multistep.Step>
	);
};

const App = () => {
	const questionInstances = [
		{
			name: "generalInformation.tl1",
			prompt: "Top Level (1)",
		},
		{
			name: "tl2",
			prompt: "Top Level (2)",
			subQuestions: [
				{ name: "subQuestion1", prompt: "Subquestion 1 of Question 2" },
				{ name: "subQuestion2", prompt: "Subquestion 2 of Question 2" },
				{ name: "subQuestion3", prompt: "Subquestion 3 of Question 2" },
			],
		},
		{
			name: "tl1",
			prompt: "Top Level (3)",
		},
		{
			name: "tl4",
			prompt: "Top Level (4)",
		},
	];

	// const splitQuestions = splitIntoSingleQuestions(questionInstances);
	const splitQuestions = splitIntoTopLevelGroupsOfSize(questionInstances, 2);
	return (
		<>
			<h1>App</h1>
			<Form>
				<Multistep initialStep="step_0">
					{splitQuestions.map(
						(questionGroup, index, allQuestions) => (
							<Step
								questionInstances={questionGroup}
								stepName={"step_" + index}
								backName={
									index === 0 ? null : "step_" + (index - 1)
								}
								nextName={
									index === allQuestions.length - 1
										? null
										: "step_" + (index + 1)
								}
							/>
						)
					)}
				</Multistep>
				<FormState />
			</Form>
		</>
	);
};
export default App;
