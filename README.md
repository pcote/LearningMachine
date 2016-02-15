Learning Machine
================

Learning Machine is a web application for organizing and managing your individual learning goals.
It'set up with the following features....

* Make and tag learning topics
* Create and practice exercises
* Make up a list of support resources for your topics of interest
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
4.  Open up the file "main_playbook.yml" in your text editor of choice.  There you will find variables in the "vars" section.  Set the following.
    1.  mysql_root_password - Choose a secure password to act as the password for the root user of the database.
    2.  public_user_password - This is a password for the database's public user account.  This account is what the user goes through to add new info to the system.
    3.  domain - The domain name.  Your running ngrok interface will have the domain name you want here.  Copy the URL found there that starts with http://
    4.  session_key - Choose a secure key to represent the session_key.  This key is used by Learning Machine's Flask component to cryptographically sign user session cookies.
5.  Save the "main_playbook.yml" file with the variables that you've set.
6.  Going back to the command line, type in "vagrant up" and hit enter.  You will now be setting up the full server running inside of Virtual Box.

#### OAuth Setup
Logging into Learning Machine requires that the user go through the Google Oauth system.  
It's beyond the scope of the instructions to explain the workings of this system, there are some things you will need. 
At the [Google Developer's console](https://console.developers.google.com), you will need the following....

* A credentials fle specifically named "client_secret.json".  This can be downloaded via the Google dev console.
* Permissions set up to access the Google Plus v. 1 API
* A redirect specified for learningmachine similar to the following kind of address. http://yourdomainhere.com/login . Note that the /login at the end is important for this setup to work.


    


Logging in
===========
When you first arrive at Learning Machine, you should see a prompt that says "Welcome to Learning Machine" with a button that says "Login with Google".  When you push that button, you will be taken to Google's login page where it will tell you that there are certain permissions needed.  When you approve, you will be taken back to Learning Machine where you will have your very own account setup for you and ready to use.

How Learning Machine Is Organized
=================================
Learning machine is organized into three general views of your materials.
1.  Topics and tags - View and manage topic and tag information
2.  Exercises and Resources - Manage exercises and resources.  Drill yourself on question too.
3.  Attempts Report - Review your history of any and all attempts made on your exercises.
4.  Open up main_playbook.yml in your editor of choice.

Managing Topics and Tags
========================
Topics and tags are the core mechanism for organizing the material that you manage under Learning Machine.  A list of tags (assuming you have some) should always be available on the left hand side.  The starting default page will have a list of topics related to some tag.

##### Adding New Topics
Any time that you are managing topics and tags, you should see a an area headed with the words "Add a Topic".  Feel free to name the topic however you wish.

Tags, on the other hand, are a little bit special.  Learning Machine treats spaces between words as if they're separate tags.  As such, you should name your tags with that fact in mind.

Pushing the "add" button will do three things.
1.  It will add a new topic to your profile.
2.  It will connect the tags you specified to that new topic.
3.  It will add new tags to your tag list if said tags didn't exist before.

#### Viewing Your Tagged Topics
The tags on the left hand of the view are clickable.  When you click them, it will take you to a topics view.  Here you will see a list of topics that are associated with the tag you clicked.

Managing Exercises and Resources
================================
All exercises and resources are associated with a specific topic.  Exercises will let you quiz yourself and rate your own knowledge.  Resources will give you links to information pertaining to that topic.  For both exercises and resources, you have options for adding new material.

#### Creating New Exercises and Resources
To choose a resource, click on a topic from your topics list.  This will take you to the "exercises and resources" view.

#### Adding Exercises
Adding exercises gives you questions you can drill yourself on to test and assess your knowledge.  In the form section under the title, "New Question", you may fill out a new question along with a corresponding answer.

Clicking the "Add Exercise" button will do the following.
1.  Associates the question with the current existing topic.  Keep in mind that each question can be connected to one topic only.
2.  Adds a new clickable question on your list of exercises for your current active topic.

#### Adding Resources
Adding resources gives you clickable links that you can refer to for extra info concerning a given topic.  In the form secion under the title "New Resource", you can put in a link text and a link url.

Clicking on "Add Resource" does the following.
1.  Associates the resource with the current existing topic.  Keep in mind that each resource can be connected to one topic only.
2.  Adds a clickable link to your list of resources which, when clicked on, will take you to the page with the needed learning resources.

#### Drilling yourself on exercises

A key part of the "exercise view" of Learning Machine is the exercise list.  Exercise lists shown here will always be connected to a specific topic.  You can assess yourself on anything by doing the following.

1.  Click on an exercise from the exercise list for the current topic.
2.  The question will pop up in a dialog box.  Consider what the answer would be to that question.  Push "Click for Anser" when you are ready to see the answer.
3.  The question and answer will show up in another dialog box with sme buttons to pick from.  Click the one that reflects how you felt that you did.  If you don't want to self-rate right now, just click anywhere outside the dialog box.

Every time you choose an answer to a question, that answer will be recorded in your history.

Reviewing Your Exercise History
===============================

Every exercise you do is recorded in your history.  You can view that history any time from the exercise view by clicking "Exercise Attempts Report" at the top of the page.  Doing so will bring up a page of every attempt ever made on every question.  The report is organized by

Topic -> Exercise -> Rating with Attempt Time

A "3" rating means you self-assessed as having done "good" on an exercise.  "2" means you rated as "okay".  "1" signifies you gave yourself a "bad" mark.

Questions
=========
If you have any questions, feel free to leave raise a new issue in the issues tracker for this project.  I appreciate any and all feedback as it can often help in making Learning Machine better.  Thanks.
