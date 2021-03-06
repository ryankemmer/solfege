const video		= document.getElementsByTagName('video' )[0];
const canvas	= document.getElementsByTagName('canvas')[0];
const img	= document.getElementsByTagName('img')[0];
const ctx		= canvas.getContext('2d');
const log		= document.getElementById('log' );

// hand data
var hand = {
	right:{
		points   : { x:[], y:[] }, // X/Y coordinates
		distance : { x:[], y:[] }, // distance from wrist
		normal   : { x:[], y:[] }  // normalized data
	},
	left:{
		points   : { x:[], y:[] },
		distance : { x:[], y:[] },
		normal   : { x:[], y:[] }
	}
}

function onResults(results) {

	// if a hand is being tracked...
	if(results.multiHandedness){
		
		// clear hand data
		hand.left  = { points: { x:[], y:[] }, distance: { x:[], y:[] }, normal: { x:[], y:[] } }
		hand.right = { points: { x:[], y:[] }, distance: { x:[], y:[] }, normal: { x:[], y:[] } }

		// for each visible hand
		results.multiHandLandmarks.forEach( function (e, i, arr) {

			// if right hand
			if(results.multiHandedness[i].label == 'Right'){
				hand.right = { points: { x:[], y:[] }, distance: { x:[], y:[] }, normal: { x:[], y:[] } }

				// get X/Y points
				var points = new Promise((resolve, reject) => {
					e.forEach((e, i, a) => {
						hand.right.points.x.push(e.x);
						hand.right.points.y.push(e.y);
						if (i === a.length -1) resolve();
					});
				});
				
				// calculate the difference between points
				var difference	= new Promise((resolve, reject) => {
					var x		= new Promise((resolve, reject) => { hand.right.points.x.forEach((e, i, a) => { hand.right.distance.x.push(diff(hand.right.points.x[0], e)); if (i === a.length -1) {resolve();} }); });
					var y		= new Promise((resolve, reject) => { hand.right.points.y.forEach((e, i, a) => { hand.right.distance.y.push(diff(hand.right.points.y[0], e)); if (i === a.length -1) {resolve();} }); });
					x.then(() => { y.then(() => { resolve() })});
				});
				
				// normalize the data from 0 to 1
				var normal		= new Promise((resolve, reject) => {
					var x		= new Promise((resolve, reject) => { hand.right.distance.x.forEach((e, i, a) => { hand.right.normal.x.push(normalize(e, Math.max(...hand.right.distance.x))); if (i === a.length -1) {resolve();} }); });
					var y		= new Promise((resolve, reject) => { hand.right.distance.y.forEach((e, i, a) => { hand.right.normal.y.push(normalize(e, Math.max(...hand.right.distance.y))); if (i === a.length -1) {resolve();} }); });
					x.then(() => { y.then(() => { resolve() })});
				});
				points.then(() => { difference.then(() => { normal.then(() => { }); }); });
				showData()
				predict()
				
			}

			// if left hand
			if(results.multiHandedness[i].label == 'Left' ){
				hand.left  = { points: { x:[], y:[] }, distance: { x:[], y:[] }, normal: { x:[], y:[] } }

				var points = new Promise((resolve, reject) => {
					e.forEach((e, i, a) => {
						hand.left.points.x.push(flip(e.x)); // flip the X axis (now both right & left hand will return same data)
						hand.left.points.y.push(e.y);
						if (i === a.length -1) resolve();
					});
				});
				var difference	= new Promise((resolve, reject) => {
					var x		= new Promise((resolve, reject) => { hand.left.points.x.forEach((e, i, a) => { hand.left.distance.x.push(diff(hand.left.points.x[0], e)); if (i === a.length -1) {resolve();} }); });
					var y		= new Promise((resolve, reject) => { hand.left.points.y.forEach((e, i, a) => { hand.left.distance.y.push(diff(hand.left.points.y[0], e)); if (i === a.length -1) {resolve();} }); });
					x.then(() => { y.then(() => { resolve() })});
				});
				var normal		= new Promise((resolve, reject) => {
					var x		= new Promise((resolve, reject) => { hand.left.distance.x.forEach((e, i, a) => { hand.left.normal.x.push(normalize(e, Math.max(...hand.left.distance.x))); if (i === a.length -1) {resolve();} }); });
					var y		= new Promise((resolve, reject) => { hand.left.distance.y.forEach((e, i, a) => { hand.left.normal.y.push(normalize(e, Math.max(...hand.left.distance.y))); if (i === a.length -1) {resolve();} }); });
					x.then(() => { y.then(() => { resolve() })});
				});
				points.then(() => { difference.then(() => { normal.then(() => { }); }); });
				showData()
				predict()
			}
			
			
		})
	}
	

	// draw hands
	ctx.save();
	ctx.clearRect(				 0, 0, canvas.width, canvas.height);
	ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
	if (results.multiHandLandmarks) {
		for (const landmarks of results.multiHandLandmarks) {
			drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
			drawLandmarks (ctx, landmarks, 					 {color: '#FF0000', lineWidth: 2});
		}
	}
	ctx.restore();
	
	
}

// setup hands
const hands = new Hands({locateFile: (file) => { return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`; }});
hands.setOptions({  maxNumHands: 2,  minDetectionConfidence: 0.5,  minTrackingConfidence: 0.5 });
hands.onResults(onResults);

// camera setup
new Camera(video, { onFrame: async () => { await hands.send({ image: video }); }, width: 1280, height: 720 }).start();
	
	
	
	var tempData = []
	// add listener to all buttons
	document.querySelectorAll('button').forEach(btn => {
	   btn.addEventListener('click', e => {
		   tempData = [];
		
		   // wait 1 second
		   setTimeout(function timer() {
			   print("starting...")

			   // push 2000 sets of data, at 50ms interval
			   for (let i = 1; i < 1000; i++) {
				 setTimeout(function timer() {console.log(hand.left)
					 if(hand.left.points.x[0] ){ tempData.push(hand.left)  }
					 if(hand.right.points.x[0]){ tempData.push(hand.right) }
					 print("training... step " + (i+ 1));
					 console.log(hand.left.distance.y); console.log(hand.right.distance.y)
					 if(i == 999){saveData()}
				 }, i * 25);
			   }
		   }, 1000);
		   
		   function saveData(){
			   print("training done")
			   exportJSON(tempData, btn.id + '.json');
		   }
		});
	});

	// print
	function print(e){
		log.innerHTML = e;
		console.log(e)
	}

	
	// show the live data to html
	function showData(){

		right.innerHTML =            "<br><b>cordinates</b><br>x: "+hand.right.points  .x.map(function(each_element){ return round(each_element) })
		right.innerHTML +=							      "<br>y: "+hand.right.points  .y.map(function(each_element){ return round(each_element) })
		right.innerHTML +=  "<br><b>distance</b> from wrist<br>x: "+hand.right.distance.x.map(function(each_element){ return round(each_element) })
		right.innerHTML +=            				      "<br>y: "+hand.right.distance.y.map(function(each_element){ return round(each_element) })
		right.innerHTML +=      "<br><b>normalized</b> data<br>x: "+hand.right.normal  .x.map(function(each_element){ return round(each_element) })
		right.innerHTML +=            				      "<br>y: "+hand.right.normal  .y.map(function(each_element){ return round(each_element) })
		
		left .innerHTML =            "<br><b>cordinates</b><br>x: "+hand.left.points  .x.map(function(each_element){ return round(each_element) })
		left .innerHTML +=            			          "<br>y: "+hand.left.points  .y.map(function(each_element){ return round(each_element) })
		left .innerHTML +=  "<br><b>distance</b> from wrist<br>x: "+hand.left.distance.x.map(function(each_element){ return round(each_element) })
		left .innerHTML +=            					  "<br>y: "+hand.left.distance.y.map(function(each_element){ return round(each_element) })
		left .innerHTML +=      "<br><b>normalized</b> data<br>x: "+hand.left.normal  .x.map(function(each_element){ return round(each_element) })
		left .innerHTML +=            				      "<br>y: "+hand.left.normal  .y.map(function(each_element){ return round(each_element) })
	}
	
	// round printed data to 2 decimals
	function round(e){
		return parseFloat(e).toFixed(2)
	}
	
		
	// export json
	function exportJSON(e, filename) {
		let link = document.createElement('a');
			link.setAttribute('href', 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(e, undefined, 2)));
			link.setAttribute('download', filename);
			link.click();
	}

	// calculate the difference between two numbers
	function diff (a, b) {
	  if (a > b) { return a - b }
	  else 		 { return b - a }
	}

	// normalize values in range of 0 to 1
	function normalize(val, max) {
		return (val - 0) / (max - 0);
	}

	// reverse 0-1 to 1-0, (for fliping left hand X axis data)
	function flip(e) {
		return (1 - 0) + ((0 - 1) / (1 - 0)) * e;
	};
		

	// predict
	function predict(){
		
		//TODO: Fix this 

		// pass live hand data to prediction model...

		//get array of x and y coordinates that are currently detected
		var x_array = hand.right.distance.x
		var y_array = hand.right.distance.y
		

		//async function to make prediction (Josh I need ur help w this)
		const predictFrame = async (pred_array) => {
			model = await tf.loadLayersModel('models/new_model/model.json');
			const prediction = await model.predict(pred_array);
			console.log('prediction ', prediction)
		}

		predictFrame(x_array);
	}
		

	// update the <img> to show the predicted hand sign
	function prediction(e){
		img.src = "img/" + e + ".png"
		document.getElementById('prediction').innerHTML =  e
	}
		
	prediction('re');

