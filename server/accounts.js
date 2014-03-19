



/*Accounts.onCreateUser(function(options,user)
{
	var accessToken=user.services.github.accessToken,
	result,
	profile;

	result=Meteor.http.get("https://api.github.com/user",{
		param: {
			access_token:accessToken
		}
	});

	if(result.error)
		throw result.error;

	profile= _.pick(result.data,
		"login",
		"name",
		"avatar_url",
		"email");

		user.profile=profile;

		return user;
});*/