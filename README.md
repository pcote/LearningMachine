Learning Machine
================

Learning Machine is a web application for organizing and managing your individual learning goals.
It'set up with the following features....

* Create exercises to practice on.
* Set up support resources to support you on those exercises.
* Review history of attempts at practice exercises to see where improvement is needed.

Installation
============

#### Prerequisites

The instructions assume you are running a modern 64-bit Linux distribution.  Beyond that, it is expected you have the following.

* [Git](https://git-scm.com/)
* [Ngrok](https://ngrok.com/)
* [Vagrant](https://www.vagrantup.com/)
* [Virtual Box](https://www.virtualbox.org/wiki/Downloads)
* [Ansible](https://www.ansible.com/)
* A Google account that will allow you to setup Google Oauth

#### The actual setup process.
1.  Set up a home directory that you will be working out of and cd to it.
2.  Run the command - git clone https://github.com/pcote/LearningMachine.git
3.  Fire up the following in a separate window to get ngrok going - ngrok 8080
4.  Open up the file "Vagrantfile" in your text editor of choice.  There you will find variables in the section called "ansible.extra_vars.  Set the following.
    1.  root_password - Choose a secure password to act as the password for the root user of the database.
    2.  public_password - This is a password for the database's public user account.  This account is what the user goes through to add new info to the system.
    3.  domain - The domain name.  Your running ngrok interface will have the domain name you want.  Copy the domain name found here.  WARNING: Do not include the "http://" parrt in this field.
    4.  session_key - Choose a secure key to represent the session_key.  This key is used by Learning Machine's Flask component to cryptographically sign user session cookies.
5.  Save the "Vagrantfile" file with the variables that you've set.
6.  Going back to the command line, type in "vagrant up" and hit enter.  You will now be setting up the full server running inside of Virtual Box.

#### OAuth Setup
Logging into Learning Machine requires that the user go through the Google Oauth system.  
It's beyond the scope of the instructions to explain the workings of this system, there are some things you will need. 
At the [Google Developer's console](https://console.developers.google.com), you will need the following....

* A credentials fle specifically named "client_secret.json".  This can be downloaded via the Google dev console.
* Permissions set up to access the Google Plus v. 1 API
* A redirect specified for learningmachine similar to the following kind of address. http://yourdomainhere.com/login . Note that the /login at the end is important for this setup to work.


#### Testing Your Setup

Now is the time to test out your installation.  Here's what you do.

1. Go to your ngrok view.  Copy the part of the url that starts with "http://"
2. Paste that url into the browser of your choice and hit enter.  (DO NOT USE a localhost address)
3. You should be at the "welcome" page.  Click the "login" button.

If all goes well, you should now have the Learning Machine main page in front of you.  Have fun!

Logging In
===========
When you first arrive at Learning Machine, you should see a prompt that says "Welcome to Learning Machine" with a button that says "Login with Google".  When you push that button, you will be taken to Google's login page where it will tell you that there are certain permissions needed.  When you approve, you will be taken back to Learning Machine where you will have your very own account setup for you and ready to use.

How Learning Machine Is Organized
=================================
Learning machine is organized into two general views of your materials.
1.  Exercises / Resources - Manage exercises.  Drill yourself on question.  Manage a list of resources to help you get better at answering those questions.
2.  Attempts Report - Review your history of any and all attempts made on your exercises.


Managing Exercises And Resources
================================
Exercises will let you quiz yourself and rate your own knowledge.  For these exercises, you have options for adding new material.

#### Creating New Exercises
1.  At the top of the screen is a button that says "Add Exercise".  Press it to make a dialog box show up.
2.  Fill out the question field with the question you will be asking yourself for this exercise.
3.  Fill out the answer field with the answer to this question.
4.  Finally, click the "Add Exercise" button that appears below the answer field in the dialog box.  This will add your exercise to the list of exercises.


#### Drilling Yourself on Exercises

A key part of the "exercise view" of Learning Machine is the exercise list.  You can assess yourself on anything by doing the following.

1.  Click on an exercise from the exercise list.
2.  The question will pop up in a dialog box.  Consider what the answer would be to that question.  Push "Click for Answer" when you are ready to see the answer.
3.  The question and answer will show up in another dialog box with some buttons to pick from.  Click the one that reflects how you felt that you did.  If you don't want to self-rate right now, just click anywhere outside the dialog box.

Every time you choose an answer to a question, that answer will be recorded in your history.

#### Creating New Learning Resources

New learning resources are just hyperlinks to other resources that can help you gain better mastery of your exercises.  The process of creating them is simple.

1.  Click on the exercise that you want to add a resource for.  This will cause a dialog box to show up.
2.  Click on the "Add Resource" button at the bottom of this dialog.  This will make a new dialog show up for adding the resource.
3.  Fill out the "New Resource Caption field with the caption you want for this url link.
4.  In the "New Resource URL" box, fill in the URL to the learning resource.
5.  When done, click the "Add Resource" button as seen in the bottom of the dialog box.

And that's it.

#### View Resources Connected To An Exercise

As you develop exercises, you will eventually have a good list of resources to work with.  Here's how you navigate to the resources you need.

1.  Scroll through your exercises to the one you want resources for.
2.  Click the green arrow on that exercise.

That's all there is to it.  You should now have a list of all the resources you set up for that particular exercise.

Reviewing Your Exercise History
===============================

Every exercise you do is recorded in your history.  You can view that history any time from the exercise view by clicking "Exercise Attempts Report" at the top of the page.  Doing so will bring up a page of every attempt ever made on every question.  The report is organized by

Exercise -> Rating with Attempt Time

Questions?
=========
If you have any questions, feel free to leave raise a new issue in the issues tracker for this project.  I appreciate any and all feedback as it can often help in making Learning Machine better.  Thanks.
