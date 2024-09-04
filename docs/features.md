# Fixes

### General

 - [x] Fix security warning
 - [ ] When using shortcuts to change tabs, the bottom bar should save the state of the last tab (it works when clicking buttons but not when using shortcuts (its acting weird, lol))
 - [x] Project structure for shared code

### Passwords Tab
 - [ ] Look into sidebar transition (it kinda lags when in the passwords tab but that's probably because of how many things are there and size calculations) (we might end up just removing the transition or adapting it to a closed state where it just shows the icons or something like that)

# Features

### General

 - [ ] Make the program launch much faster
 - [x] `Cache system` manage a way to store info or cache the data so we dont have delay when opening a new tab that was already loaded (the delay is extremely small but the user experience is 10x better without it as it will be instant and snappy, this is a must have):
	- `Fix:` the delay is now gone, the app is snappy and fast as they all load when the app starts and are stored in memory and we just use display none to hide them and show them when needed


- [ ] Add a Provider for settings (like the theme, etc) (this will be used to store the settings in the database and load them when the app starts but still needs to be reactive at all times so we can change the theme (and other things) and it will change instantly)

## Passwords Tab

- [X] Make Cancel button work
- [X] Make the top bar buttons work
- [ ] add one icon to the beginning of each row for notes (could be activated in settings)
	- [ ] inside each one add a button to add a new topic which can have a description and a title
- [ ] On website click prompt to open it in browser (maybe)
- [ ] Filter button bottom-bar
	- [x] Add a search box
	- [x] add filters:
		- [x] Search for only username and email (example), checkbox for where we want to search
		- [ ] Search for only notes (just add another checkbox)

- [ ] View button bottom-bar (maybe)
	- [ ] Default is List(what we already have)
	- [ ] Group by Some field


## Steam Manager Tab

- [ ] A new database table for the steam accounts
- [ ] A new database table for the steam api keys (when one doesnt work we use another one, let's put a limit of 5 keys and a button to manage them in the steam tab on the top left maybe (we'll see later what looks better))

- [ ] Add a button to add a new account
- [ ] Possibility to add more accounts and remove them (turning it into a list maybe its the best option)
- [x] Make it work even better (kinda buggy, sometimes doesnt launch steam properly)
- [x] Add much more info about each account (like the games they have, the acc name, etc)
- [x] Fetch info from the steam api
- [x] Make a clean banner for each account


## Settings Tab
- [ ] Add themes maybe ? (maybe not, if so will be implemented after everything else)
- [ ] Add a button to clear all the data ( Drop the table )
- [ ] Add a button to open file explorer
- [ ] Email group with icons
- [ ] Bottom-bar close on cancel may be a toggle
- [ ] Button to activate or deactivate the notes feature
- [ ] Checkbox for autofocus when opening filter tab

## Future (further away features to add)

 - [ ] Add support for other platforms like Linux and Mac (linux will come first)
