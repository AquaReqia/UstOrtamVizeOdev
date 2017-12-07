$(function () { 
	$("#navbarToggle").blur(function (event) {
		var screenWidth = window.innerWidth;
		if (screenWidth < 768) {
			$("#collapsable-nav").collapse('hide');
		}
	});
	
	$("#navbarToggle").click(function (event) {
		$(event.target).focus();
	});
});

(function (global) {

	var dc = {};
	dc.YuksekLisans = false;
	dc.Lisans = false;
	dc.Donem = -1;
	dc.Sinif = -1;
	
	var homeHtml = "snippets/home-snippet.html";
	
	var lisansHTML = "snippets/Lisans-snippet.html";
	var donemHTML = "snippets/Donem-snippet.html";
	var sinifHTML = "snippets/Sinif-snippet.html";
	var dersProgramiHTML = "snippets/Dersler-snippet.html";
	var personelHTML = "snippets/Personel-snippet.html";
	var titleHTML = "snippets/Title-snippet.html";
	var DerslerJsonURL = "js/Dersler.json";


	
	var insertHtml = function (selector, html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};

	var showLoading = function (selector) {
		var html = "<div class='text-center'><img src='images/ajax-loader.gif'></div>";
		insertHtml(selector, html);
	};

	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace, "g"), propValue);
		return string;
	}

	var switchMenuToActive = function () {
		var classes = document.querySelector("#navHomeButton").className;
		classes = classes.replace(new RegExp("active", "g"), "");
		document.querySelector("#navHomeButton").className = classes;

		classes = document.querySelector("#navMenuButton").className;
		if (classes.indexOf("active") == -1) {
		classes += " active";
		document.querySelector("#navMenuButton").className = classes;
		}
	};

	document.addEventListener("DOMContentLoaded", function (event) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest( homeHtml, function (responseText) {insertHtml("#main-content",responseText)},false);
	});
	
	dc.loadMenuEgitim = function () {
		dc.YuksekLisans = false;
		dc.Lisans = false;
		dc.Donem = -1;
		dc.Sinif = -1;
	
		buildHTML(lisansHTML,"Eğitim");
	};
	
	dc.loadMenuDonem = function (Secim) {
		if(Secim == 2)
			dc.YuksekLisans = true;
		else
			dc.Lisans = true;
		
		buildHTML(donemHTML, "Dönem");
	};
	
	dc.loadMenuSinif = function (Secim) {
		dc.Donem = Secim;
		
		if(dc.YuksekLisans == true) //Abi Bu Adam Yüksek Lisans Sınıfı Yok Direk Geç !!!
			buildDers("Ders Programı");
		else
			buildHTML(sinifHTML,"Sınıf");
	};
	
	dc.loadMenuDersProg = function (Secim) {
		dc.Sinif = Secim;
		buildDers("Ders Programı");
	};
	
	function buildDers(Title)
	{
		$ajaxUtils.sendGetRequest(titleHTML, function (titleResponseText) {
			titleResponseText = insertProperty(titleResponseText, "name", Title);
			
			$ajaxUtils.sendGetRequest(dersProgramiHTML, function (DPresponseText) {
				
				var Dersler = "";
				$ajaxUtils.sendGetRequest(DerslerJsonURL, function (responseJSON) {
					var myObject = eval('(' + responseJSON + ')');				
					var YariYil = ((dc.Sinif - 1) * 2)  + dc.Donem;
				
					DPresponseText = insertProperty(DPresponseText, "Donem", dc.Donem);	
					DPresponseText = insertProperty(DPresponseText, "Yil", dc.Sinif);	
					DPresponseText = insertProperty(DPresponseText, "Yariyil", YariYil);	
					
					
					for(var di = 0; di < myObject.length;di++)
					{
						if(myObject[di].Yariyil == YariYil)
						{
							var Ders = myObject[di];
							var Siniflar = Ders.Siniflar;
							var Saatler = Ders.Saat;
							var Gun = Ders.Gun;
							
							var STR = "";
							
							var SaatId = 1;
							while(Saatler["S" + SaatId])
							{
								STR = "";
								var SinifId = 1;
								while(Siniflar["Sinif" + SinifId])
								{
									if(STR != "") STR = STR + " / ";
									STR = STR + '<span class="schedule_course_name">' + Ders.Ad + '</span>';
									STR = STR + '<span class="schedule_group_name">(' +	Siniflar["Sinif" + SinifId].Derslik + ')</span>';
									if(Siniflar["Sinif" + SinifId].Aciklama != "")
										STR = STR + '<span class="schedule_class_name">[' +	Siniflar["Sinif" + SinifId].Aciklama + ']</span>';
									
									SinifId++;
								}
								DPresponseText = insertProperty(DPresponseText, "Ders" + Saatler["S" + SaatId] + "-" + Gun, STR);	
								SaatId++;
							}
						}
					}
				
						
					for(var x = 1;x < 10 ; x++)
						for(var y = 1;y < 6 ; y++)
							DPresponseText = insertProperty(DPresponseText, "Ders" + x + "-" + y, "");	
						
					titleResponseText = insertProperty(titleResponseText, "special_instructions", DPresponseText);		
								
					insertHtml(".jumbotron",titleResponseText);
				}, false);
			}, false);
		}, false);
	}
	
	function buildHTML (HTMLPageLink,Title) {
		showLoading(".jumbotron");
		
		$ajaxUtils.sendGetRequest(titleHTML, function (titleResponseText) {
			titleResponseText = insertProperty(titleResponseText, "name", Title);
			
			$ajaxUtils.sendGetRequest(HTMLPageLink, function (pageResponseText) {
					titleResponseText = insertProperty(titleResponseText, "special_instructions", pageResponseText);			
					insertHtml(".jumbotron",titleResponseText)	
				}, false);	
		}, false);
	}

	global.$dc = dc;

})(window);
