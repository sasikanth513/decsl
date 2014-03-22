// Initizing all the required collections
Polls_Coll=new Meteor.Collection('polls_coll');
Ques_Coll=new Meteor.Collection('ques_coll');
User_Coll=new Meteor.Collection('user_coll');
Product_Mobiles=new Meteor.Collection('product_mobiles');

Accounts.config({
       sendVerificationEmail:true

    });

//Publishing required collections to the users	
		Meteor.publish('pollsCollection',function(){

			//Publishing all polls to the user
				return Polls_Coll.find({});		
			});
		Meteor.publish('productmobiles',function(){
				return Product_Mobiles.find({});
			});
		Meteor.publish('quesCollection',function(){
				//Publishing all questions to the user
				return Ques_Coll.find({});
			});
		Meteor.publish("email", function() {
				if(Meteor.user().services.facebook)
				{
			 		return Meteor.users.find({_id: this.userId}, {fields: {'services.facebook.email': 1}}); 
				}
				else if(Meteor.user().services.google)
				{
					return Meteor.users.find({_id: this.userId}, {fields: {'services.google.email': 1}}); 
				}
			});

					
// Giving delete,update and modify control to the user(if he/she is the owner of the document) on polls collection
		Polls_Coll.allow({
			insert:function(){
					return true;
					},
			update:function(userId, doc, fields, modifier){
					return true;
					},
			remove:function(userId,doc){
				return  doc.owner === userId;
			}
		});
		
//Giving delete,update and modify control to the user(if he/she is the owner of the document) on questions collection		
		
	Ques_Coll.allow({
			insert:function(){
					return true;
					},
			update:function(userId, doc, fields, modifier){
					return true;
					},
			remove:function(userId,doc){
				return  doc.owner === userId;
			}
	});

	
	//search for product 
	function returnAllResult(s_string,start,rows)
	{
			var skimlinks = Meteor.require('skimlinksjs');
			skimlinks.setup("5b010e041007c65a3a08a48d01227d6b");
			var skimlinks_query = Async.wrap(skimlinks.query);
			// var title_val="title:\""+s_string+"\"  AND price:[30000 TO 500000]";
			 var title_val="title:\""+s_string+"\" AND merchant:(buy.com OR *egg* OR Ebuyer OR eBay OR Tigerdirect OR Verizon Wireless)  AND price:[10000 TO 50000]";
			//var title_val="title:\"electric bicycle\"  AND merchantCategory:*bikes*" AND merchant:*Amazon*  AND merchantCategory:*phones;
			console.log("api method called")
			console.log(title_val);
			var result = skimlinks_query({
							searchFor: title_val,
							start:start,
							rows:rows,
							fq: "country:US"
				   		});
			return result;
	}
	function returnAllCats()
	{
			var skimlinks = Meteor.require('skimlinksjs');
				
			skimlinks.setup("5b010e041007c65a3a08a48d01227d6b");
			var skimlinks_query = Async.wrap(skimlinks.categories);
			var result = skimlinks_query();
			return result;

			
	}
	//searching for a product id
	function returnProductResult(s_string)
	{
			var skimlinks = Meteor.require('skimlinksjs');
				
			skimlinks.setup("5b010e041007c65a3a08a48d01227d6b");
			var skimlinks_query = Async.wrap(skimlinks.query);
			//var s_string=Session.get("search_string");
			var pro_id="productId:\""+s_string+"\"";
			console.log(pro_id);
			var result = skimlinks_query({
								searchFor: pro_id,
								fq: "country:US"
				   				});
			//var res=result.skimlinksProductAPI.products[0].merchant;
			//var result="55555";
			return result;
	}

	function Facebook(accessToken) {
	    this.fb = Meteor.require('fbgraph');
	    this.accessToken = accessToken;
	    this.fb.setAccessToken(this.accessToken);
	    this.options = {
	        timeout: 3000,
	        pool: {maxSockets: Infinity},
	        headers: {connection: "keep-alive"}
	    }
	    this.fb.setOptions(this.options);
	}

	Facebook.prototype.query = function(query, method) {
	    var self = this;
	    var method = (typeof method === 'undefined') ? 'get' : method;
	    var data = Meteor.sync(function(done) {
	        self.fb[method](query, function(err, res) {
	            done(null, res);
	        });
	    });
	    return data.result;
	}

	Facebook.prototype.getUserData = function() {
	    return this.query('me');
	}

	Facebook.prototype.getFriendsData = function() {
	    return this.query('/me/friends?fields=username');
	}

// On server start-up intialize all these methods
  Meteor.startup(function() {
  	process.env.MAIL_URL = 'smtp://postmaster%40sandbox22840.mailgun.org:redesygnsystems@smtp.mailgun.org:587';
       Accounts.emailTemplates.from = "Redesygn Systems <info@redesygn.com>";

    return Meteor.methods(
	{
		//Entering u-name to the polls collection if he/she vote on particular question if he is not already voted on any of the option
	 	updatePosts: function(arg1,arg2,arg3) 
		{
				
				var ins_doc=Polls_Coll.update({_id:arg1,"option1.pd":arg2},{$push:{"option1.$.ids":arg3}});
				console.log(ins_doc);
				return ins_doc;
      		},
		updatePosts2: function(arg1,arg2,arg3) 
		{
				
				
				return Polls_Coll.update({_id:arg1,"option2.pd":arg2},{$push:{"option2.$.ids":arg3}});	

      		},
		updatePosts3: function(arg1,arg2,arg3) 
		{
				
				var u_name=Meteor.user().profile.name;
				return Polls_Coll.update({_id:arg1,"option3.pd":arg2},{$push:{"option3.$.ids":arg3}});	

      		},
		updatePosts4: function(arg1,arg2,arg3) 
		{
				
				var u_name=Meteor.user().profile.name;
				return Polls_Coll.update({_id:arg1,"option4.pd":arg2},{$push:{"option4.$.ids":arg3}});	

      		},
      			
	      	upvote:function(arg1,arg2,arg3)
	      	{
	      			Ques_Coll.update({_id:arg1,"comments.cmt_text":arg3},{ $inc: { "comments.$.vCount": 1 } });		
	      			return Ques_Coll.update({_id:arg1,"comments.cmt_text":arg3},{$push:{"comments.$.votes":arg2}});
	      	},
	      	// Skimlinks API code to search for a particular product title and returns the result to called method
		apiresult:function(arg1,arg2,arg3)
		{
			//var wrappedMethod = Async.wrap(returnAllResult);
			var response = returnAllResult(arg1,arg2,arg3);
			//    return response.skimlinksProductAPI.numFound;
			return response;

		},
		// Skimlinks API code to search for a particular product id and returns the result to called method
		productIdResult:function(arg2)
		{
			//var wrappedMethod = Async.wrap(returnAllResult);
			var proResponse = returnProductResult(arg2);
			//    return response.skimlinksProductAPI.numFound;
			return proResponse;

		},	
		returnCategories:function()
		{
			var res=returnAllCats();
			return res;
		},
		
		//Method to remove all posts in the collection	
		removeAllPolls: function() {

	        		return Polls_Coll.remove({});

	  		},
	      	//Methods to remove all questions in the collection
	      	removeAllQues: function(){
	      		return Ques_Coll.remove({});
	      	},
	      	getUserData: function() 
		{
		       var fb = new Facebook(Meteor.user().services.facebook.accessToken);
		       var data = fb.getUserData();
		       console.log("getuserdata called")
		        return data;
		},
		getFriendsData: function() {   
		    var fb = new Facebook(Meteor.user().services.facebook.accessToken);
		    var data = fb.getFriendsData();
		    return data;
		}
		
    	});
  });

	




