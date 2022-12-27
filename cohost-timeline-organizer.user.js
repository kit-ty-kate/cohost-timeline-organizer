// ==UserScript==
// @name         cohost-timeline-organizer
// @namespace    http://exn.st
// @version      0.1
// @description  TODO
// @author       kit-ty-kate
// @match https://cohost.org/*
// @match https://*.cohost.org/*
// @exclude https://cohost.org/*/post/*
// @exclude https://cohost.org/rc/search
// @exclude https://cohost.org/rc/project/*
// @exclude https://cohost.org/rc/user/*
// @exclude https://cohost.org/rc/posts/unpublished*
// @grant        none
// ==/UserScript==

(function() {
  // Disabled because otherwise i can’t use objects as hashtables (seen[id])
  //'use strict';

  const prefix = "cohost-timeline-organizer-";

  let seen = JSON.parse(localStorage.getItem(prefix + "seen"));
  if (seen === null) {
    seen = {version: 1, length: 0};
    localStorage.setItem(prefix + "seen", JSON.stringify(seen));
  }

  function getID(post) {
    const data_testid = post.getAttribute("data-testid").split("-");

    if (data_testid.length !== 2) {
      console.log("cohost-timeline-organizer: data_testid <> 2");
      return false;
    }
    if (data_testid[0] !== "post") {
      console.log("cohost-timeline-organizer: data_testid[0] <> post");
      return false;
    }

    return data_testid[1];
  }

  function organize(post) {
    const id = getID(post);

    if (id === false) {
      return;
    }

    let footer = post.getElementsByTagName("article")[0].getElementsByTagName("footer")[0];
    let comment_text = footer.children[0].children[0].textContent;

    // If comment count change, redisplay it
    if (seen[id] !== undefined && seen[id].comment_text === comment_text) {
      post.parentNode.style.display = "none";
    }

    // Add the button to tell if the post was read or not
    let new_elm = document.createElement('div');
    new_elm.setAttribute("class", "w-6 h-6 pointer relative");
    // https://www.onlinewebfonts.com/icon/152088
    new_elm.insertAdjacentHTML("afterbegin", '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.5" viewBox="0 0 1000 1000"><g><path d="M962.8,129.8l-76.2-92.6C875.7,20.9,853.9,10,826.7,10H173.3c-27.2,0-49,10.9-65.3,27.2l-70.8,92.6C20.9,151.6,10,173.3,10,200.6v680.6C10,941,59,990,118.9,990h762.2C941,990,990,941,990,881.1V200.6C990,173.3,979.1,151.6,962.8,129.8L962.8,129.8z M500,799.4L200.6,500h190.6V391.1h217.8V500h190.6L500,799.4L500,799.4z M124.3,118.9l43.6-54.4h653.3l49,54.4H124.3L124.3,118.9z"></path></g></svg>');
    new_elm.onclick = () => {
      const len = seen.length;
      seen[id] = {version: 1, comment_text: comment_text};
      seen.length = len + 1;
      localStorage.setItem(prefix + "seen", JSON.stringify(seen));
      post.parentNode.style.display = "none";
    };
    footer.children[0].children[1].insertAdjacentElement("beforebegin", new_elm);
  }

  // Code comes from https://github.com/nex3/cohost-dedup
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.dataset.view === 'post-preview') {
          organize(node);
        } else {
          for (const thread of node.querySelectorAll('[data-view=post-preview]')) {
            organize(thread);
          }
        }
      }
    }
  });
  observer.observe(document.body, {subtree: true, childList: true});
})();