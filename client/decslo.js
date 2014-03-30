Polls_Coll=new Meteor.Collection('polls_coll');
Ques_Coll=new Meteor.Collection('ques_coll');
User_Coll=new Meteor.Collection('user_coll');

fbques_coll=new Meteor.Collection('fbques_coll');
fbpolls_coll=new Meteor.Collection('fbpolls_coll');

var ffruids=new Array();
//Adding pages to the iron-router
Router.map(function(){

	this.route('index', {path: '/' });
		this.route('polls', {path:'/polls/',
		fastRender: true
	});
		this.route('myaccount', {path:'/myaccount/',
			fastRender: true
	});
	this.route('pollpage', {path:'/pollpage/:_id',
		 data:  function(){
					 
					 return Polls_Coll.findOne({_id:this.params._id});
				},
		fastRender: true
	 });
	this.route('quespage', {path:'/quespage/:_id',
		 data:  function(){
					 
					 return Ques_Coll.findOne({_id:this.params._id});
				},
		fastRender: true
	 });
	this.route('questions', {path:'/questions',
		fastRender: true
	});
	this.route('searchpage', {path:'/searchpage/',
		fastRender: true
	});
	this.route('product', {path:'/product/:productId',
		fastRender: true
	});
});

Accounts.ui.config({
	requestPermissions: {
        facebook: ['email', 'user_friends','read_friendlists'],
         google:['https://www.google.com/m8/feeds']
    },
    requestOfflineToken: {
      google: true
  },
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});




	// on startup user subscribes to all the polls and question collections
	Meteor.startup(function()
	{
		Session.set("spage_start_number",0);
		Session.set("spage_end_number", 10);
		
		Session.set("ppage_start_number",0);
		Session.set("ppage_end_number", 5);

		Deps.autorun(function () {
			// subscribing to the polls,questions and users collection(reactive collections)
			Meteor.subscribe('pollsCollection');
			Meteor.subscribe('quesCollection');
			Meteor.subscribe('userCollection');
			Meteor.subscribe('productmobiles');
			Meteor.subscribe('fbquesCollection');
			Meteor.subscribe('fbpollsCollection');
		});
				
	
	});
		
function deleteEvent()
{
	console.log(this._id);
}

	var uniqid,abc,incno=0,incno2=0;
	//setup before functions
		var typingTimer;                //timer identifier
		var doneTypingInterval = 500;  //time in ms, 5 second for example

	Template.user_loggedout.events({
		"click #login":function(e,tmpl){
			Meteor.loginWithGithub({
				requestPermisssions: ['user','public_repo']
			},function(err){
				if(err){
					//error handling
				}else{
					//show alert
				}

			});
		}
	});

	Template.user_loggedin.events({

		"click #logout":function(e,tmpl){
			Meteor.logout(function(err){
				if(err){
					//show error message
				}else{
					//show alert
				}
			});
		}
	});
	
	function createPoll(){
				var u_id=Meteor.userId();
				//reading poll question
				var quest=document.getElementById('question').value;
				//reading options title
				var op1=document.getElementById('op1').value;
				var op2=document.getElementById("op2").value;
				var op3=document.getElementById("op3").value;
				var op4=document.getElementById("op4").value;
				//getting product ids and store them in collection 
				var pro_id1=Session.get("product1");
				var pro_id2=Session.get("product2");
				var pro_id3=Session.get("product3");
				var pro_id4=Session.get("product4");
				//saving data to sort the polls in home screen
				var dat=new Date();
				var c_time=dat.getFullYear()+""+dat.getMonth()+""+dat.getDate()+""+dat.getHours()+""+dat.getMinutes()+""+dat.getSeconds()+""+dat.getMilliseconds();
				console.log(c_time);
				if(Meteor.user().username)
				{
					var u_name=Meteor.user().username;
				}
				else 
				{
					var u_name=Meteor.user().profile.name;
				}
				var nnid=Polls_Coll.insert({question: quest,owner:u_id,owner_name:u_name,created_at:c_time,
							option1:[{pd:op1,pro_id:pro_id1,ids:[]}],
							option2:[{pd:op2,pro_id:pro_id2,ids:[]}],
							option3:[{pd:op3,pro_id:pro_id3,ids:[]}],
							option4:[{pd:op4,pro_id:pro_id4,ids:[]}]
							});
				console.log(nnid); 
				//after inserting values to the collection user redirected to the pollpage(displaying the question)
				Router.go('pollpage', {_id: nnid});
				
	}

	// create polling : inserting values to the poll collection
	Template.polls.events({
			'click input.create-poll': function () {

				if( Meteor.user()) 
				{
					if(Meteor.user().emails)
					{
						if(Meteor.user().emails[0].verified)
						{
							createPoll();
						}
						else
						{
							document.getElementById('warning').innerHTML=" Verify your e-mail to create a poll";
						}
					}
					else
					{
						createPoll();
					}
					
				
			}
			else
			{
				document.getElementById('warning').innerHTML="*Login to create Poll ";
			}
		
			},
		//auto complete action to pollpage question field
		'focus input.focus_event':function()
		{
		
			var arr2=_(Polls_Coll.find().fetch()).pluck("question");
			$( "#question" ).autocomplete({source:arr2,minLength:5});
					
		},
		//auto complete action to pollpage option fields   
		'keyup input.pad-top':function()
		{

			console.log("at starting");
			//on keyup, start the countdown
			clearTimeout(typingTimer);
			if ($('#op1').val)
			{
				 typingTimer = setTimeout(doneTyping, doneTypingInterval);
			}
			
			//user is "finished typing," do something
			function doneTyping () {
				 //do something
				 var arr=new Array();
				 arr.length=0;
				 console.log(arr);
				 var s_string=document.getElementById("op1").value;
				 console.log(s_string);
				 Meteor.call('apiresult',s_string,0,10,function(error,resul){
					
					console.log(resul.skimlinksProductAPI.numFound);
					console.log(resul.skimlinksProductAPI.products[0].title);
					
					for(var i=0;i<10;i++)
					{
						
						arr[i]=resul.skimlinksProductAPI.products[i].title;
					}
					console.log(arr);
					
					$( "#op1").autocomplete({source:arr});
					
				 });
		}
				
		},
		'keyup input.pad-top2':function()
		{

			console.log("at starting");
			 //on keyup, start the countdown
			clearTimeout(typingTimer);
			if ($('#op2').val)
			{
				 typingTimer = setTimeout(doneTyping, doneTypingInterval);
			}
			
			//user is "finished typing," do something
			function doneTyping () {
				 //do something
				 var arr=new Array();
				 arr.length=0;
				 console.log(arr);
				 var s_string=document.getElementById("op2").value;
				 console.log(s_string);
				 Meteor.call('apiresult',s_string,0,10,function(error,resul){
					
					console.log(resul.skimlinksProductAPI.numFound);
					console.log(resul.skimlinksProductAPI.products[0].title);
					
					for(var i=0;i<10;i++)
					{
						
						arr[i]=resul.skimlinksProductAPI.products[i].title;
					}
					console.log(arr);
					// arr[0]=result.skimlinksProductAPI.products.title;
					$( "#op2").autocomplete({source:arr});
					
				 });
		}
				
		},
		'keyup input.pad-top3':function()
		{

			console.log("at starting");
		//on keyup, start the countdown
			clearTimeout(typingTimer);
			if ($('#op3').val)
			{
				 typingTimer = setTimeout(doneTyping, doneTypingInterval);
			}
			
			//user is "finished typing," do something
			function doneTyping () {
				 //do something
				 var arr=new Array();
				 arr.length=0;
				 console.log(arr);
				 var s_string=document.getElementById("op3").value;
				 console.log(s_string);
				 Meteor.call('apiresult',s_string,0,10,function(error,resul){
					
					console.log(resul.skimlinksProductAPI.numFound);
					console.log(resul.skimlinksProductAPI.products[0].title);
					
					for(var i=0;i<10;i++)
					{
						
						arr[i]=resul.skimlinksProductAPI.products[i].title;
					}
					console.log(arr);
					// arr[0]=result.skimlinksProductAPI.products.title;
					$( "#op3").autocomplete({source:arr});
					
				 });
		}
				
		},
		'keyup input.pad-top4':function()
		{

			console.log("at starting");
		//on keyup, start the countdown
			clearTimeout(typingTimer);
			if ($('#op4').val)
			{
				 typingTimer = setTimeout(doneTyping, doneTypingInterval);
			}
			
			//user is "finished typing," do something
			function doneTyping () {
				 //do something
				 var arr=new Array();
				 arr.length=0;
				 console.log(arr);
				 var s_string=document.getElementById("op4").value;
				 console.log(s_string);
				 Meteor.call('apiresult',s_string,0,10,function(error,resul){
					
					console.log(resul.skimlinksProductAPI.numFound);
					console.log(resul.skimlinksProductAPI.products[0].title);
					
					for(var i=0;i<10;i++)
					{
						
						arr[i]=resul.skimlinksProductAPI.products[i].title;
					} 
					console.log(arr);
					// arr[0]=result.skimlinksProductAPI.products.title;
					$( "#op4").autocomplete({source:arr});
					
				 });
		}
				
		},
		'focusout input.pad-top':function()
		{
			console.log("focus out event");
			var op1_value=document.getElementById("op1").value;
			Meteor.call("apiresult",op1_value,0,10,function(e,r){
				console.log("taking back the result");
				console.log(r);
				document.getElementById("op1_title").innerHTML=r.skimlinksProductAPI.products[0].title;
				// document.getElementById("op1_spec").innerHTML=r.skimlinksProductAPI.products[0].description;
				document.getElementById("op1_price").innerHTML=r.skimlinksProductAPI.products[0].price;
				document.getElementById("op1_image").src=r.skimlinksProductAPI.products[0].images.imageThumb1Url;
				var pro1=r.skimlinksProductAPI.products[0].productId;
				Session.set("product1",pro1);

			});

		},
		'focusout input.pad-top2':function()
		{
			console.log("focus out event");
			var op1_value=document.getElementById("op2").value;
			Meteor.call("apiresult",op1_value,0,10,function(e,r){
				console.log("taking back the result");
				console.log(r);
				document.getElementById("op2_title").innerHTML=r.skimlinksProductAPI.products[0].title;
				// document.getElementById("op1_spec").innerHTML=r.skimlinksProductAPI.products[0].description;
				document.getElementById("op2_price").innerHTML=r.skimlinksProductAPI.products[0].price;
				document.getElementById("op2_image").src=r.skimlinksProductAPI.products[0].images.imageThumb1Url;
				var pro2=r.skimlinksProductAPI.products[0].productId;
				Session.set("product2",pro2);

			});

		},
		'focusout input.pad-top3':function()
		{
			console.log("focus out event");
			var op1_value=document.getElementById("op3").value;
			Meteor.call("apiresult",op1_value,0,10,function(e,r){
				console.log("taking back the result");
				console.log(r);
				document.getElementById("op3_title").innerHTML=r.skimlinksProductAPI.products[0].title;
				// document.getElementById("op1_spec").innerHTML=r.skimlinksProductAPI.products[0].description;
				document.getElementById("op3_price").innerHTML=r.skimlinksProductAPI.products[0].price;
				document.getElementById("op3_image").src=r.skimlinksProductAPI.products[0].images.imageThumb1Url;
				var pro3=r.skimlinksProductAPI.products[0].productId;
				Session.set("product3",pro3);
			});

		},
		'focusout input.pad-top4':function()
		{
			console.log("focus out event");
			var op1_value=document.getElementById("op4").value;
			Meteor.call("apiresult",op1_value,0,10,function(e,r){
				console.log("taking back the result");
				console.log(r);
				document.getElementById("op4_title").innerHTML=r.skimlinksProductAPI.products[0].title;
				// document.getElementById("op1_spec").innerHTML=r.skimlinksProductAPI.products[0].description;
				document.getElementById("op4_price").innerHTML=r.skimlinksProductAPI.products[0].price;
				document.getElementById("op4_image").src=r.skimlinksProductAPI.products[0].images.imageThumb1Url;
				var pro4=r.skimlinksProductAPI.products[0].productId;
				Session.set("product4",pro4);
			});

		}
	
		});
	
	Template.questions.events({
		//auto complete action to question page questio field
		'focus input.focus_event':function()
		{
		
			var arr2=_(Ques_Coll.find().fetch()).pluck("question");
			$( "#question" ).autocomplete({source:arr2});
					
		},
		//Inserting question to Ques_Coll collection
		'click input.create-ques': function () {

			if ( Meteor.user()) 
			{
				var quest=document.getElementById('question').value;
				var u_id=Meteor.userId();
				var dat=new Date();
				var c_time=dat.getFullYear()+""+dat.getMonth()+""+dat.getDate()+""+dat.getHours()+""+dat.getMinutes()+""+dat.getSeconds()+""+dat.getMilliseconds();
				console.log(c_time);
				if(Meteor.user().username)
				{
					var u_name=Meteor.user().username;
				}
				else 
				{
					var u_name=Meteor.user().profile.name;
				}
				var new_id=Ques_Coll.insert({question: quest,created_at:c_time,owner:u_id,owner_name:u_name,comments:[]});
				console.log(new_id);
				Router.go('quespage', {_id:new_id});
			}
			else
			{
				alert("Login to Create Question")
			}
		
			}

	});
	// adding vote: checks whether user already voted or not, if not add the vote
	Template.product_thumbnail.events({
		'click input.add-vote': function () {
		
				var option_data=Polls_Coll.findOne({_id:this._id}).option1[0].pd;    
				//checking whether any user logged-in or not
				if( Meteor.user())
				{
					//if user logged-in removing warning message on the field
					document.getElementById('warning').innerHTML="";
					var u_id=Meteor.userId();
					//checking whether user already voted on any of the options       
					var u_exist=Polls_Coll.find({_id:this._id,option1:{$elemMatch:{ids:u_id}}}).count();            
					var u_exist2=Polls_Coll.find({_id:this._id,option2:{$elemMatch:{ids:u_id}}}).count();
					var u_exist3=Polls_Coll.find({_id:this._id,option3:{$elemMatch:{ids:u_id}}}).count();
					var u_exist4=Polls_Coll.find({_id:this._id,option4:{$elemMatch:{ids:u_id}}}).count();
					
					//checking whether user already voted on any of the options
					if(u_exist===0 && u_exist2===0 && u_exist3===0 && u_exist4===0)
					{
						console.log("name not found");
						console.log(option_data);
						//calling server method:Inserting name into the voted list
						Meteor.call('updatePosts',this._id,option_data,u_id,function(e,result){
								console.log(result);
							});
					}
					//if user already voted on the question display warning message
					else
					{
						
						document.getElementById('warning').innerHTML="* Already voted on this question";
					}
				 }
				//if user not logged-in showing warning message 
			 else
			 {
					document.getElementById('warning').innerHTML="* Login to vote";
			 }
		}
		});
	Template.searchpage.events({
		'click input.search-btn':function()
		{
			Session.set("spage_start_number", 0);
			Session.set("spage_end_number", 10);
			var search_ele=document.getElementById("autocomplete").value;
			if(search_ele)
			{
				Session.set("search_string",search_ele);
				Router.go('searchpage');
			}
			document.getElementById("search-warning").innerHTML="* Enter words to search";
		},
	
		'keypress input.focus_eve': function (evt) {
				if (evt.which === 13) 
				{
					Session.set("spage_start_number", 0);
					Session.set("spage_end_number", 10);
					console.log("event occured")
						var search_elem=document.getElementById("autocomplete").value;
					console.log(search_elem);
					if(search_elem)
					{
						Session.set("search_string",search_elem);
						Router.go('searchpage');
					}
					document.getElementById("search-warning").innerHTML="* Enter words to search";
				}
		},
		'click #prevButton':function(){
			var start=Session.get("spage_start_number")-10;
			var end=Session.get("spage_end_number");

			Session.set("spage_start_number", start);
			Session.set("spage_end_number", end);
		},
		'click #nextButton':function(){
			var start=Session.get("spage_start_number")+10;
			var end=Session.get("spage_end_number");

			Session.set("spage_start_number", start);
			Session.set("spage_end_number", end);  
		}
	})
	
	//Search page helpers
	Template.searchpage.helpers({
		displayResult:function(){
		
				var s_str=Session.get("search_string");
				//calling server method to search for a element in the api
				var start=Session.get("spage_start_number");
				var end=Session.get("spage_end_number");

				Meteor.call('apiresult',s_str,start,end,function(e,result)
				{
					console.log(result);
					Session.set("object",result);
				});
				},
		resultCursor:function(){
				//get the result and return the cursor to the user
				var abc=Session.get("object");
				console.log(abc);
				return abc;    
		},
		
		//returning results from the polls
		poll_result:function(){
					var search_element=Session.get("search_string");
					return Polls_Coll.find({question:{$regex:search_element+"*"}});
					},
		//returning results from the questions
		ques_result:function(){
					var search_element=Session.get("search_string");
					return Ques_Coll.find({question:{$regex:search_element+"*"}});
					}                             
							
	});
	
	Template.product_thumbnail.helpers({
		op1_votes:function(){
		
		return   Polls_Coll.findOne({_id:this._id}).option1[0].ids.length;
		},
		op_id1:function()
		{
			return this._id+"1";
			
		},
		product1:function()
		{
			/*var coll_var1=Polls_Coll.findOne({_id:this._id});
			if(!coll_var1)
			{
				var var1_coll=coll_var1.option1[0].pro_id
			}
			Meteor.call("productIdResult",coll_var1,function(error,result){

					Session.set("product_results",result);
			})*/
			var coll_var=Polls_Coll.findOne({_id:this._id}).option1[0].pro_id;
			Meteor.call("productIdResult",coll_var,function(error,result){

					Session.set("product_results",result);
			})
		},
		product_res:function()
		{
			var fgh=Session.get("product_results");
			return fgh;
		}
		
		});
		
	//second option thumbnail  
	Template.product_thumbnail_two.events({
			'click input.add-vote': function () {
			
			var option_data=Polls_Coll.findOne({_id:this._id}).option2[0].pd;	
			//checking whether user logged-in or not  
			if( Meteor.user())   
			{
				//if logged-in remove the warning message
				document.getElementById('warning').innerHTML="";
				var u_id=Meteor.userId();
				//checking whether user already voted on this question or not
				var u_exist=Polls_Coll.find({_id:this._id,option1:{$elemMatch:{ids:u_id}}}).count();            
				var u_exist2=Polls_Coll.find({_id:this._id,option2:{$elemMatch:{ids:u_id}}}).count();
				var u_exist3=Polls_Coll.find({_id:this._id,option3:{$elemMatch:{ids:u_id}}}).count();
				var u_exist4=Polls_Coll.find({_id:this._id,option4:{$elemMatch:{ids:u_id}}}).count();
				if(u_exist===0 && u_exist2===0 && u_exist3===0 && u_exist4===0)
				{
					console.log("name not found");
					
					//Inserting name into the voted list
					Meteor.call('updatePosts2',this._id,option_data,u_id,function(e,result){
							console.log(result);
						});
				}
				else
				{
					//if already voted on this question show the warning message
					document.getElementById('warning').innerHTML="* Already voted on this question";
				}
			 }
			 //if user not logged-in display warning message
			 else
			 {
					document.getElementById('warning').innerHTML="* Login to vote";
			 }
			
		}
		});
		
	Template.product_thumbnail_two.helpers({
		op2_votes:function(){
		
				return   Polls_Coll.findOne({_id:this._id}).option2[0].ids.length;
		},
		op_id2:function()
		{
			return this._id+"2";
		},
		product2:function()
		{
			var coll_var=Polls_Coll.findOne({_id:this._id}).option2[0].pro_id;
			Meteor.call("productIdResult",coll_var,function(error,result){

					Session.set("product_results2",result);
			})
		},
		product_res:function()
		{
			var fgh=Session.get("product_results2");
			return fgh;
		}
		});
		
		
	//third option thumbnail   
	Template.product_thumbnail_three.events({
			'click input.add-vote': function () {
			
			//checking whether usr loggedin or not
			if( Meteor.user())
			{
				//if user logged-in deleting the warning message
				document.getElementById('warning').innerHTML="";
				 var option_data=Polls_Coll.findOne({_id:this._id}).option3[0].pd;  
				var u_id=Meteor.userId();
				
				//checking whether user already voted on this question or not
				var u_exist=Polls_Coll.find({_id:this._id,option1:{$elemMatch:{ids:u_id}}}).count();            
				var u_exist2=Polls_Coll.find({_id:this._id,option2:{$elemMatch:{ids:u_id}}}).count();
				var u_exist3=Polls_Coll.find({_id:this._id,option3:{$elemMatch:{ids:u_id}}}).count();
				var u_exist4=Polls_Coll.find({_id:this._id,option4:{$elemMatch:{ids:u_id}}}).count();
				if(u_exist===0 && u_exist2===0 && u_exist3===0 && u_exist4===0)
				{
					console.log("name not found");
					
					//Inserting name into the voted list
					Meteor.call('updatePosts3',this._id,option_data,u_id,function(e,result){
							console.log(result);
						});
				}
				//if user already voted on this question display warning message
				else
				{
					document.getElementById('warning').innerHTML="* Already voted on this question";
				}
			 }
			 //if user not logged-in showing error message label on the page
			 else
			 {
					document.getElementById('warning').innerHTML="* Login to vote";
			 }
		}
		});
	Template.product_thumbnail_three.helpers({
		op3_votes:function(){
		
			return   Polls_Coll.findOne({_id:this._id}).option3[0].ids.length;
		},
		op_id3:function()
		{
			return this._id+"3";
		},
		product3:function()
		{
			var coll_var=Polls_Coll.findOne({_id:this._id}).option3[0].pro_id;
			Meteor.call("productIdResult",coll_var,function(error,result){

					Session.set("product_results3",result);
			})
		},
		product_res:function()
		{
			var fgh=Session.get("product_results3");
			return fgh;
		}
		});
		
	//fourth option thumbnail
	Template.product_thumbnail_four.events({
			'click input.add-vote': function () {  
			//checking whether user logged-in or not
			if( Meteor.user())
			{
				//if user logged-in removing the warning message
				document.getElementById('warning').innerHTML="";
				 var option_data=Polls_Coll.findOne({_id:this._id}).option4[0].pd;
				var u_id=Meteor.userId();
				//checking whether user already voted on this question or not
				var u_exist=Polls_Coll.find({_id:this._id,option1:{$elemMatch:{ids:u_id}}}).count();            
				var u_exist2=Polls_Coll.find({_id:this._id,option2:{$elemMatch:{ids:u_id}}}).count();
				var u_exist3=Polls_Coll.find({_id:this._id,option3:{$elemMatch:{ids:u_id}}}).count();
				var u_exist4=Polls_Coll.find({_id:this._id,option4:{$elemMatch:{ids:u_id}}}).count();
				if(u_exist===0 && u_exist2===0 && u_exist3===0 && u_exist4===0)
				{
					console.log("name not found");
					
					//Inserting name into the voted list
					Meteor.call('updatePosts4',this._id,option_data,u_id,function(e,result){
							console.log(result);
						});
				}
				//showing warning if user already voted on this question
				else
				{
					document.getElementById('warning').innerHTML="* Already voted on this question";
				}
			 }
			 //if user not logged-in displaying warning message
			 else
			 {
					document.getElementById('warning').innerHTML="* Login to vote";
			 }
		}
		});
	Template.product_thumbnail_four.helpers({
		op4_votes:function(){
		
			return   Polls_Coll.findOne({_id:this._id}).option4[0].ids.length;
		},
		op_id4:function()
		{
			return this._id+"4";
		},
		product4:function()
		{
			var coll_var=Polls_Coll.findOne({_id:this._id}).option4[0].pro_id;
			Meteor.call("productIdResult",coll_var,function(error,result){
					Session.set("product_results4",result);
			})
		},
		product_res:function()
		{
			var fgh=Session.get("product_results4");
			return fgh;
		}
		});
		
	
	Template.display_ques.events({
		'click button.clik-eve': function () {
		
			if( Meteor.user())   
			{
				//adding comment along with the username and votes to the Ques_Coll collection
				var asd=document.getElementById("comment_text").value;
				if(Meteor.user().username)
				{
					var u_name=Meteor.user().username;
				}
				else 
				{
					var u_name=Meteor.user().profile.name;
				}
				var cValue=0;
				console.log(this._id);
				console.log(u_name);
				Ques_Coll.update({_id:this._id},{$push:{comments:{uname:u_name,uid:Meteor.userId(),cmt_text:asd,vCount:cValue,votes:[]}}});
			}
			else
			{
				alert("Login to Comment")
			}
		},
		'click input.add-up':function(){
			var url = window.location.pathname;
			var id = url.substring(url.lastIndexOf('/') + 1);
			/*id=this._id;
			console.log(this._id);*/
			console.log(this.cmt_text);
			var u_name=Meteor.userId();
			//var ins_doc=Polls_Coll.update({_id:arg1,"option1.pd":arg2},{$push:{"option1.$.ids":u_name}});
			Meteor.call("upvote",id,u_name,this.cmt_text,function(e,r){
			console.log(r);
			});
	
						
		}
		
		});
		
	Template.polls_coll.helpers({
			 polls_coll: function()
		 {
				 return Polls_Coll.find();
			 }
		});

	Template.display_poll.helpers({
		uniqueid:function()
		{
			uniqid = Date.now();
			abc=uniqid;
			
		},
		unique_id:function()
		{
			return abc;
		},
		id_op1:function()
		{
			return this._id+"1";
		},
		id_op2:function()
		{
			return this._id+"2";
		},
		id_op3:function()
		{
			return this._id+"3";
		},
		id_op4:function()
		{
			console.log("id_op4",+this._id)
			return this._id+"4";
		},
		product_title1:function()
		{
			var poll=Polls_Coll.findOne({_id:this._id});
			if(!poll) 
			{
					return '';
			}
			else
			{
  				return poll.option1[0].pd;
			}
		},
		product_title2:function()
		{
			return Polls_Coll.findOne({_id:this._id}).option2[0].pd;
		},
		product_title3:function()
		{
			return Polls_Coll.findOne({_id:this._id}).option3[0].pd;
		},
		product_title4:function()
		{
			return Polls_Coll.findOne({_id:this._id}).option4[0].pd;
		}

	});   
	
	Template.display_ques.helpers({

		uniqid:function()
		{
			uniqid = Date.now();
			abc=uniqid;
		},
		uniq_id:function()
		{
			return abc;
		},

		/*details:function()
		{
			var url = window.location.pathname;
			var id = url.substring(url.lastIndexOf('/') + 1);
			return Ques_Coll.find( { _id: id } )
		},*/
		all_comments:function()
		{
			var coll = Ques_Coll.findOne(this._id);
				return _.sortBy(coll.comments, function(comment) {
					return -comment.vCount;
			})
		}/*,
		pagination:function()
		{
						
			return pagination.create(Ques_Coll.findOne({_id:this._id}).comments.length);

		}*/
	});
	
	
	Template.display_product.helpers({
	detail:function()
	{
			var url = window.location.pathname;
			var id = url.substring(url.lastIndexOf('/') + 1);
			var id1 =id.replace("%7C","|");
			//var id1=this._id;
			console.log(id1);
			Meteor.call('productIdResult',id1,function(e,results)
				{
					console.log(results);
					Session.set("productIdSearch",results);
				});
							
	},
	product:function(){
				var pid=Session.get("productIdSearch");
				console.log(pid);
				return pid;    
		}
	
	});

	
	Template.index.events({
	'keyup input.focus_eve':function()
	{

		
	},
	
	'click input.search-btn':function()
	{
			var search_ele=document.getElementById("autocomplete").value;
			if(search_ele)
			{
				Session.set("search_string",search_ele);
				Router.go('searchpage');
			}
			document.getElementById("search-warning").innerHTML="* Enter words to search";
	},
	
  'keypress input.focus_eve': function (evt) {
	 if (evt.which === 13) 
	 {
		console.log("event occured")
			var search_elem=document.getElementById("autocomplete").value;
		console.log(search_elem);
		if(search_elem)
		{
			Session.set("search_string",search_elem);
			Router.go('searchpage');
		}
		document.getElementById("search-warning").innerHTML="* Enter words to search";
	 }
  }

	});
	
	

		Template.index.helpers({
			pollscoll: function()
		{
			
			
			return Polls_Coll.find({},{sort: {created_at: -1}},{limit : 10});
		},
		ques_coll: function()
		 {
				 return Ques_Coll.find({}, {sort: {created_at: -1}},{limit : 10});
		 },
		 categories:function()
		 {
			console.log("client method called");
			Meteor.call("returnCategories",function(e,r){

				console.log(r);
			})
			console.log("client method returned");
		 },
		 googleContacts:function(){
		 	Meteor.call('googleContacts', function (error, result) {
		 		console.log(result);
		 	});
		 }
		});
	Template.my_polls.helpers({
			 pollscoll: function()
		 {

				 return Polls_Coll.find({owner:Meteor.userId()});
			 }
	});
	Template.my_ques.helpers({
		quescoll: function()
		 {
				 return Ques_Coll.find({owner:Meteor.userId()});
			 }
		});

Template.myaccount.events({
'click .deletePoll':function(){
	console.log(this._id);
	Polls_Coll.remove({_id:this._id})

},
'click .deleteQues':function(){
	console.log(this._id);
	Ques_Coll.remove({_id:this._id})
}
});

// start of similarproduct template events and helpers

Template.similarProducts.events({
	'click #prevButton':function(){
		var start=Session.get("ppage_start_number")-5;
		var end=Session.get("ppage_end_number");

		Session.set("ppage_start_number", start);
		Session.set("ppage_end_number", end);
	},
	'click #nextButton':function(){
		var start=Session.get("ppage_start_number")+5;
		var end=Session.get("ppage_end_number");

		Session.set("ppage_start_number", start);
		Session.set("ppage_end_number", end);  
	}
});

//similarproduct template 
Template.similarProducts.helpers({
	details:function()
	{
		var title=this.title;
		var title1=title.slice(0,15);
		console.log(title1);
		
		var start=Session.get("ppage_start_number");
		var end=Session.get("ppage_end_number");

		Meteor.call('apiresult',title1,start,end,function(e,results)
			{
				console.log(results);
				Session.set("productnameSearch",results);
			});                     
	},
	similarProducts:function()
	{
		var pid=Session.get("productnameSearch");
		console.log(pid);
		return pid;    
	}
});

//end of similarProducts template events and helpers

Template.fbques.events({
    
});

Template.fbques.helpers({
	friendsQues: function () {
		Meteor.call('getFriendsData', function(err, data2) { 
        		console.log(data2);
        		Session.set("fbfdata", data2);
        		
        		
        	});
	return Session.get("fbfdata");
	},
	questions:function(){
		var fbf_name=this.name;
		Meteor.call('isFbExists', this.username, function (error, result) {
			if(result)
			{
				console.log(result);
				// console.log(Ques_Coll.find({owner:result._id}));
				var ee=Ques_Coll.find({owner:result._id});
				//return ee;
				ee.forEach(function (row) {
					//console.log(fbques_coll.insert({qid:row._id,question:row.question,owner:row.owner}));
					if(row._id)
					{
						fbques_coll.insert({_id:row._id,question:row.question,created_at:row.created_at,owner_name:row.owner_name});
					}
					/*var mydiv = document.getElementById("sss");
					console.log(row.question);
					var frag ="<a href=/quespage/"+row._id+">" + row.question+"</a>      -"+fbf_name+"<br>";
					mydiv.innerHTML = mydiv.innerHTML + frag;*/
					
				});				
			}
		});
		
	},
	fb_ques:function(){
		/*var myArray = fbques_coll.find({},{sort: {created_at: -1}}).fetch();
		var distinctArray = _.uniq(myArray, false, function(d) {return d.qid});
		console.log("distinctArray" + distinctArray);
		return distinctArray;*/
		//var  ef= _.pluck(distinctArray, 'qid');

		return fbques_coll.find({},{sort: {created_at: -1}});
		
	},
	clearColl:function(){
		Meteor.call('removefbQues', function (error, result) {});
	}
});				



Template.fbpolls.events({
    
});

Template.fbpolls.helpers({
	friendsQuess: function () {
		Meteor.call('getFriendsData', function(err, data3) { 
        		console.log(data3);
        		Session.set("fbfpolldata", data3);
        		
        		
        	});
	return Session.get("fbfpolldata");
	},
	questionss:function(){
		
		Meteor.call('isFbExists', this.username, function (error, result) {
			if(result)
			{
				console.log(result);
				
				var ee=Polls_Coll.find({owner:result._id});
				
				ee.forEach(function (rows) {
					
					if(rows._id)
					{
						console.log("inserting")
						fbpolls_coll.insert({_id:rows._id,question:rows.question,created_at:rows.created_at,owner_name:rows.owner_name});
					}
					
				});				
			}
		});
		
	},
	fb_quess:function(){
		
		return fbpolls_coll.find({},{sort: {created_at: -1}});
		
	},
	clearColl:function(){
		Meteor.call('removefbPolls',  function (error, result) {});
	}
});				

