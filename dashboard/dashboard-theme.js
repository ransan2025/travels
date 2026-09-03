/*=====================================
RANSAN DASHBOARD THEME
=====================================*/

const DashboardTheme={

accent:"#ffd54f",

primary:"#1565c0",

secondary:"#7b1fa2",

background:"#08111f",

glass:"rgba(255,255,255,.10)"

};

/*=====================================
LOAD FESTIVAL THEME
=====================================*/

function loadDashboardTheme(){

if(

window.activeFestival

){

applyFestivalTheme(

window.activeFestival

);

}

else{

applyDefaultTheme();

}

}

/*=====================================
DEFAULT
=====================================*/

function applyDefaultTheme(){

document.documentElement

.style

.setProperty(

"--accent",

DashboardTheme.accent

);

document.documentElement

.style

.setProperty(

"--primary",

DashboardTheme.primary

);

document.documentElement

.style

.setProperty(

"--secondary",

DashboardTheme.secondary

);

}

/*=====================================
FESTIVAL
=====================================*/

function applyFestivalTheme(festival){

document.documentElement

.style

.setProperty(

"--accent",

festival.accentColor||

"#ffd54f"

);

document.documentElement

.style

.setProperty(

"--primary",

festival.primaryColor||

"#1565c0"

);

document.documentElement

.style

.setProperty(

"--secondary",

festival.secondaryColor||

"#7b1fa2"

);

}

/*=====================================
AUTO
=====================================*/

document.addEventListener(

"DOMContentLoaded",

function(){

loadDashboardTheme();

}

);