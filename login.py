from oauth2client import client


class LoginHandler(object):
    """
    Class written to handle the process of Oauth logins via Google.
    Assumes that a secrets file was gotten from the Google Developer Console.
    Also assumes that permission scope and redirects are registered there as well.
    """


    def __init__(self, secrets_file, scope, redirect_uri):
        self.secrets_file = secrets_file
        self.scope = scope
        self.redirect_uri = redirect_uri
        self.flow = client.flow_from_clientsecrets(secrets_file, scope=scope, redirect_uri=redirect_uri)
        self.__display_name = None
        self.__email = None

    @property
    def auth_url(self):
        """
        Makes a url that can be used to send the user on over to a Google login page.
        :return: The proper Google login url.
        """
        url = self.flow.step1_get_authorize_url()
        return url


    def setup_user_info(self, code):
        """
        Setup business that happens after the user has successfully logged in and was redirected back to the todo app.
        Takes the code that Google returns to my app and trades it in for a propert token that can be used to call
        the Google API.

        Finally, just calls the API so that the display name and email can be stuck into session scope.
        :param code: The code that Google returns upon redirect from Google after a successful login.
        :return: Nothing.  Email and display name placed into session scope.
        """
        import httplib2
        from apiclient import discovery
        creds = self.flow.step2_exchange(code)
        http_auth = creds.authorize(httplib2.Http())
        service = discovery.build("plus", "v1", http_auth)
        res = service.people().get(userId="me").execute()
        self.__email = res.get("emails")[0].get("value")
        self.__display_name = res.get("displayName")


    @property
    def email(self):
        """
        Accessor for user email address.
        :return: the current logged in user's email address.
        """
        return self.__email

    @property
    def display_name(self):
        """
        Accessor for the full name of the user.
        :return: The full username.
        """
        return self.__display_name