/*
 Copyright 2020 Grigori Fursin
*/

// Cache cK requests
var cache={};

// Only allow URLs with research papers and code (ArXiv, GitHub, cknowledge, paperswithcode ...)
const allowed_urls=[
  "mozilla",
  "aaai.org",
  "academia.edu",
  "acm.org",
  "arxiv.org",
  "biomedcentral.com",
  "biorxiv.org",
  "bitbucket.org",
  "elsevier.com",
  "figshare.com",
  "github.com",
  "gitlab.com",
  "ieee.org",
  "kdd.org",
  "mendeley.com",
  "mitpressjournals.org",
  "mlsys.org",
  "nature.com",
  "neurips.cc",
  "openai.com",
  "openreview.net",
  "paperswithcode.com",
  "reddit.com",
  "researchgate.net",
  "roboticsproceedings.org",
  "sciencedirect.com",
  "semanticscholar.org",
  "siam.org",
  "sourceforge.net",
  "springer.com",
  "springerprofessional",
  "supercomputing.org",
  "tensorflow.org",
  "usenix.org",
  "wiley.com",
  "zenodo.org",
  "adapt-workshop.org",
  "advances.sciencemag.org",
  "ai.google",
  "ai.stanford.edu",
  "books.google.com",
  "citeseerx.ist.psu.edu",
  "conf.researchr.org",
  "conference.scipy.org",
  "doi.org",
  "einstein.ai",
  "hal.inria.fr",
  "hub.docker.com",
  "research.fb.com",
  "research.google",
  "scholar.google",
  "yann.lecun.com"
];

var CR_BROWSER='mozilla';

async function initializePageAction(tab) {

   if (!localStorage.initialized) {
     localStorage.checked = 0;
     localStorage.initialized = true;
   }

   var url='';

   // Get URL
   try {
     url=tab.url;
   } catch (error) {}

   var checked=localStorage.checked;

   // Updated addon icons in all tabs
   if (checked==0) {
      chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status3.png"});
   } else {
      // Try to check status from cache
      if ((url in cache) && (cache[url]!=null)) {
        var data=cache[url];
        var status=data['status'];

        /* Check status */
        if (status==1) {
//           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status1.png"});
           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status2.png"});
        } else if (status==2) {
           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status2.png"});
        } else {
           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status0.png"});
        }
      } else {
        chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status0.png"});
      }
   }

   chrome.pageAction.show(tab.id);

   if (checked==1 && (url.startsWith('http:') || url.startsWith('https:'))) {

      var data={};
      var html='';

      // Force cache clean just for testing/debugging
//      cache={};

      // Check if URL is allowed (block non research websites for privacy)
      var allow_url=false;

      for (var i = 0; i < allowed_urls.length; i++) {
         if (url.indexOf(allowed_urls[i]) >= 0) {
            allow_url=true;
            break;
         }
      }

      // Contact open cKnowledge.io repository to get related artifacts for an allowed URL
      if (allow_url) {
        if (url in cache) {
          if (cache[url]==null) return;
          data=cache[url];
        }
        else {
          // preparing cache (but not yet cached - avoiding parallel calls)
          cache[url]=null;

          var dict = {
                      'action':'get_url_knowledge', 
                      'dict':{
                        'url':url,
                        'cr_browser':CR_BROWSER,
                        'cr_plugin_version':chrome.runtime.getManifest().version
                       }
                     };

          let r=accessCK('https://cKnowledge.io/api/v1/?', dict, null);

          data=await r;
        }

        if (!('return' in data) || data['return']>0) {
          var error='';
          if ('error' in data) error=data['error'];
          else error='unknown output from the cKnowledge portal';

          html='<div id="cr_box">\n';
          html+=error+'\n';
          html+='</div>\n'
        }
      }

      // Check that response from cKnowledge.io is correct
      if (data && "status" in data) {
        cache[url]=data;

        var status=data['status'];

        /* Check status */
        if (status==1) {
//           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status1.png"});
           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status2.png"});
        } else if (status==2) {
           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status2.png"});
        } else {
           chrome.pageAction.setIcon({tabId: tab.id, path: "../icons/status0.png"});
        }

        // check if inside panel
        if ('html' in data) {
          html=data['html'];
        }
      }

      // check if inside panel
      var cd=document.getElementById('cr_dashboard');

      // Visualize HTML (remove malicious code)
      if (cd && html!="") {
        /* Sanitize HTML to avoid malicious code */
        cd.innerHTML=DOMPurify.sanitize(html);
      }
   }
}

/*
When first loaded, initialize the page action for all tabs.
*/
var gettingAllTabs = chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {
  for (let tab of tabs) {
    initializePageAction(tab);
  }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
chrome.tabs.onUpdated.addListener((id, info, tab) => {
//  if (info.status === 'complete') 
    initializePageAction(tab);

    if (tab.id!=null && localStorage.checked==1 && info.status === 'complete') {
      try {
        chrome.tabs.sendMessage(tab.id, {text: 'cr_check_page', url:tab.url}); 
      } catch (error) {}
    }

});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) 
{
  if(msg.update_icon) {
     chrome.tabs.query({active:true, windowType:"normal", currentWindow: true},function(tabs){
        var tab = tabs[0];

        initializePageAction(tab);
    })
  }
});

chrome.tabs.onActivated.addListener(function(info){
    chrome.tabs.get(info.tabId, function(tab){

        if (!localStorage.initialized) {
          localStorage.checked = 0;
          localStorage.initialized = true;
        }

        initializePageAction(tab);
    });
});
