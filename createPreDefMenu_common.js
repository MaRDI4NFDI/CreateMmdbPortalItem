/* 

Navigation menu for creating MaRDI items (all types) in the MaRDI Portal 
with predefined values, duplicate label and login check.

Code by Björn Schembera & Aurela Shehu within the MaRDI project.

*/



(function() {
  // INITIALIZATION: Set up guards and configuration before building the UI
  
  // Restrict to item namespace (disabled to show button everywhere)
  // if (mw.config.get('wgNamespaceNumber') !== 120) return;
  
  // Only run on view pages (not edit or other modes)
  if (mw.config.get('wgAction') !== 'view') return;
  
  // Skip if the page is a redirect
  if (mw.config.get('wgIsRedirect')) return;

  // Unique identifier for the dropdown menu
  var linkId = 't-mardi_create_item';
  
  // Prevent duplicate menu creation - exit if already added to page
  if (document.getElementById(linkId)) return;
  
  // Enable verbose duplicate-check output (displays alerts and console logs)
  var MARDI_DUPLICATE_CHECK_VERBOSE = true;
  
  // If true, only consider exact matches in English (`en`) as duplicates
  // Set to false to check all languages for duplicates
  var MARDI_DUPLICATE_CHECK_STRICT_EN = true;

  // Login helper using config variable; avoids relying on mw.user which might not
  // be initialised early. wgUserId is '0' for anon users.
  function userIsLoggedIn() {
    var id = mw.config.get('wgUserId');
    return id && id !== '0';
  }

  // UI SETUP: Wait for the sidebar to load, then inject the dropdown menu
  // Use setInterval to poll for nav-items since they may not be immediately available
  var sidebarInterval = setInterval(function() {
    var navItems = document.getElementsByClassName('nav-item');
    var sidebarContainer = null;

    // Detect skin early so we can adapt UI accordingly
    var skin = (typeof mw !== 'undefined' && mw.config) ? (mw.config.get('skin') || '') : '';
    var isVector = skin.indexOf && skin.indexOf('vector') !== -1;

    // Prefer existing nav-item container (works for Chameleon)
    if (navItems && navItems.length > 0) {
      sidebarContainer = navItems[0].parentNode;
    }

    console.log('ProductionPortalMenu: detected skin=', skin, 'isVector=', isVector);

    // Fallbacks for other skins: try a list of likely sidebar selectors
    if (!sidebarContainer) {
      var candidates = [
        document.querySelector('#mw-panel'),
        document.querySelector('.mw-sidebar'),
        document.querySelector('.vector-menu'),
        document.querySelector('.vector-menu-content'),
        document.querySelector('nav[role="navigation"]'),
        document.querySelector('aside'),
        document.querySelector('.mw-portlet'),
        document.querySelector('#p-navigation')
      ];
      for (var c = 0; c < candidates.length; c++) {
        if (candidates[c]) { sidebarContainer = candidates[c]; break; }
      }
      if (!sidebarContainer) {
        var alt = document.querySelector('.page-sidebar, .menu, .menu__list');
        if (alt) sidebarContainer = alt;
      }
    }

    var useFloatingFallback = (!sidebarContainer);
    console.log('ProductionPortalMenu: sidebarContainer=', sidebarContainer, 'useFloatingFallback=', useFloatingFallback);

    clearInterval(sidebarInterval);  // Stop polling once sidebar is found

    // DROPDOWN STRUCTURE: Create the main container and trigger link
    // Main dropdown container - positioned relative so submenu can be absolutely positioned
    var container = document.createElement('div');
    container.id = linkId;
    // Use existing skin classes where helpful, fall back to generic ones
    container.className = isVector ? 'vector-menu mw-list-item' : 'nav-item mw-list-item';
    container.style.position = 'relative'; // needed for dropdown positioning

    // Main link/trigger - clicking this toggles submenu visibility
    var mainLink = document.createElement('span');
    mainLink.className = isVector ? 'vector-menu-heading' : 'nav-link';
    mainLink.style.cursor = 'pointer';
    mainLink.appendChild(document.createTextNode('MathModDB'));
    container.appendChild(mainLink);

    // Submenu container - appears below main link, hidden by default
    var submenu = document.createElement('div');
    submenu.style.position = 'absolute';
    submenu.style.top = '100%';
    submenu.style.left = '0';
    submenu.style.backgroundColor = '#fff';
    submenu.style.border = '1px solid #ccc';
    submenu.style.padding = '5px 0';
    submenu.style.minWidth = '200px';
    submenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
    submenu.style.display = 'none';
    submenu.style.flexDirection = 'column';
    submenu.style.zIndex = 1000;

    // Add a small beta note to the top of the dropdown
    var betaNote = document.createElement('div');
    betaNote.style.padding = '6px 12px';
    betaNote.style.fontSize = '12px';
    betaNote.style.color = '#333';
    betaNote.style.borderBottom = '1px solid #eee';
    betaNote.style.backgroundColor = '#fafafa';
    betaNote.innerHTML = 'Create new item...';
    submenu.appendChild(betaNote);

    // MENU ITEMS: Define which item types can be created
    // Each item has a display text and an associated creation function
    // To add more item types: (1) add entry here, (2) create a function below (see section: "Functions for each item type")
    var items = [
      { text: 'Academic Discipline', fn: createAcademicDiscipline },
      { text: 'Research Problem', fn: createResearchProblem },
      { text: 'Mathematical Model', fn: createMathematicalModel },
      { text: 'Computational Task', fn: createComputationalTask },
      { text: 'Mathematical Expression', fn: createMathematicalExpression },
      { text: 'Quantity', fn: createQuantity },
      { text: 'Quantity Kind', fn: createQuantityKind }
      
    ];

    // SUBMENU RENDERING: Create a clickable menu item for each item type
    for (var i = 0; i < items.length; i++) {
      var link = document.createElement('div');
      link.textContent = items[i].text;
      // Style each menu item
      link.style.padding = '5px 15px';        // Add space inside the menu item
      link.style.cursor = 'pointer';          // Show pointer cursor to indicate clickability
      link.style.whiteSpace = 'nowrap';       // Prevent text wrapping
      
      // Add hover effect - highlight background on mouseover
      link.onmouseover = function() { this.style.backgroundColor = '#f0f0f0'; };
      // Remove highlight when mouse leaves
      link.onmouseout = function() { this.style.backgroundColor = '#fff'; };
      
      // Bind the click handler using IIFE to capture the correct function in the closure
      // check login state before calling
      (function(fn){
        link.onclick = function(e) {
          if (!userIsLoggedIn()) {
            alert('Error: You have to be logged in to create items.');
            return;
          }
          fn();
        };
      })(items[i].fn);
      submenu.appendChild(link);
    }

    // Attach submenu to main container and add to sidebar
    container.appendChild(submenu);
    // If using floating fallback, append to body and style as fixed button
    if (useFloatingFallback) {
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.left = '20px';
      container.style.zIndex = 10000;
      container.style.backgroundColor = '#fff';
      container.style.border = '1px solid #ccc';
      container.style.padding = '6px';
      container.style.borderRadius = '4px';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.gap = '6px';
      container.style.minWidth = '140px';
      container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.18)';
      // Adjust submenu to open above the floating button
      submenu.style.top = 'auto';
      submenu.style.bottom = '100%';
      submenu.style.left = '0';
      document.body.appendChild(container);
      // Ensure mainLink is visible on different themes
      try {
        mainLink.style.color = '#000';
        mainLink.style.fontWeight = '600';
        mainLink.style.fontSize = '13px';
        mainLink.style.display = 'inline-block';
        mainLink.style.padding = '4px 8px';
      } catch (e) {}
      console.log('ProductionPortalMenu: appended floating container to body');
    } else {
      // Append to an appropriate place in the sidebar.
      if (isVector) {
        // Prefer the vector menu list if present
        var place = sidebarContainer.querySelector && (sidebarContainer.querySelector('.vector-menu-content-list') || sidebarContainer.querySelector('.vector-menu-content') || sidebarContainer.querySelector('.menu__list'));
        try {
          if (place && place.tagName && place.tagName.toLowerCase() === 'ul') {
            // Create an li compatible with other vector menu items and append a nested <ul> inside it
            var li = document.createElement('li');
            li.id = 'n-t-mardi_create_item';
            li.className = 'mw-list-item';
            var a = document.createElement('a');
            a.href = '#';
            // toggle nested submenu visibility on click; start collapsed
            a.onclick = function(e){
              e.preventDefault();
              if (nested.style.display === 'none') {
                nested.style.display = 'block';
                a.setAttribute('aria-expanded', 'true');
              } else {
                nested.style.display = 'none';
                a.setAttribute('aria-expanded', 'false');
              }
            };
            var span = document.createElement('span');
            span.textContent = 'Create MathModDB Item';
            a.appendChild(span);
            li.appendChild(a);
            // Create a nested list matching Vector structure for submenu entries
            var nested = document.createElement('ul');
            nested.className = 'vector-menu-content-list';
            // start collapsed so the submenu is closed on initial load
            nested.style.display = 'none';
            nested.style.marginLeft = '8px';
            nested.style.paddingLeft = '8px';
            a.setAttribute('aria-expanded', 'false');
            nested.setAttribute('role', 'menu');
            for (var j = 0; j < items.length; j++) {
              (function(fn, text) {
                var subli = document.createElement('li');
                subli.className = 'mw-list-item';
                subli.style.listStyle = 'none';
                subli.style.paddingLeft = '8px';
                var suba = document.createElement('a');
                suba.href = '#';
                suba.onclick = function(e) { 
                  e.preventDefault();
                  if (!userIsLoggedIn()) {
                    alert('Error: You have to be logged in to create items.');
                    return;
                  }
                  fn();
                };
                var subspan = document.createElement('span');
                subspan.textContent = text;
                suba.appendChild(subspan);
                subli.appendChild(suba);
                nested.appendChild(subli);
              })(items[j].fn, items[j].text);
            }
            li.appendChild(nested);
            place.appendChild(li);
            // Ensure skin scripts don't auto-expand: enforce collapsed state after skin runs
            setTimeout(function() {
              try {
                nested.style.display = 'none';
                a.setAttribute('aria-expanded', 'false');
                li.classList.remove('vector-menu-item-expanded');
              } catch (e) {}
            }, 250);
            console.log('ProductionPortalMenu: appended li with nested list to vector menu list');
          } else if (place) {
            place.appendChild(container);
            console.log('ProductionPortalMenu: appended container to vector place (non-list)');
          } else {
            sidebarContainer.appendChild(container);
            console.log('ProductionPortalMenu: appended container to sidebarContainer (no place)');
          }
        } catch (e) {
          sidebarContainer.appendChild(container);
          console.log('ProductionPortalMenu: append to sidebar failed, fallback append', e);
        }
      } else {
        sidebarContainer.appendChild(container);
      }
    }

    // EVENT HANDLERS: Toggle and close submenu
    // For non-Vector skins or fallback, use mainLink click handler
    if (!isVector || useFloatingFallback) {
      mainLink.onclick = function() {
        submenu.style.display = (submenu.style.display === 'none') ? 'flex' : 'none';
      };
    }

    // Close submenu if user clicks anywhere outside the dropdown (improves UX)
    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        submenu.style.display = 'none';
      }
    });

    console.log('MaRDI MathModDB Create Item dropdown added!');
  }, 200);

  // ==================================================
  // ITEM CREATION FUNCTIONS: Define each item type
  // ==================================================
  // Each function calls createItem() with type-specific configuration
  // 
  // Property Reference (Production Portal):
  //   P31 - "instance of": the item class (type of entity being created)
  //   P1495 - "community": always Q6534265 (MaRDI community)
  //   P1460 - "profile": specifies which profile template to use
  //     - Q6534268: Academic discipline profile
  //     - Q6534292: Research problem profile  
  //     - Q6534270: Mathematical model profile
  //     - Q6534271: Quantity/Quantity kind profile
  //     - Q6534272: Computational task profile
  // 
  // Each function collects user input via prompts and creates a new item
  // with appropriate claim values.
  
  /**
   * Creates a new Academic Discipline item
   * Prompts user for label and description, then creates item with proper claims
   */
  function createAcademicDiscipline() {
    createItem({
      labelPrompt: 'Enter new academic discipline label (English, should not be empty):',
      descPrompt: 'Enter new academic discipline description (English, may be empty):',
      claims: {
        P31: { numericId: 60231 }, // instance of academic discipline (Q60231)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534268 } // MaRDI academic discipline profile (Q6534268)
      }
    });
  }

  /**
   * Creates a new Research Problem item
   */
  function createResearchProblem() {
    createItem({
      labelPrompt: 'Enter new research problem label (English, should not be empty):',
      descPrompt: 'Enter new research problem description (English, may be empty):',
      claims: {
        P31: { numericId: 6534292 }, // instance of research problem (Q6534292)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534269 }  // MaRDI research problem profile (Q6534269)
      }
    });
  }

  /**
   * Creates a new Mathematical Model item
   */
  function createMathematicalModel() {
    createItem({
      labelPrompt: 'Enter new mathematical model label (English, should not be empty):',
      descPrompt: 'Enter new mathematical model description (English, may be empty):',
      claims: {
        P31: { numericId: 68663 }, // instance of mathematical model (Q68663)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534270 } // MaRDI mathematical model profile (Q6534270)
      }
    });
  }
  
  /**
   * Creates a new Computational Task item
   */
  function createComputationalTask() {
    createItem({
      labelPrompt: 'Enter new computational task label (English, should not be empty):',
      descPrompt: 'Enter new computational task description (English, may be empty):',
      claims: {
        P31:   { numericId: 6534247 },  // instance of computational task (Q6534247)
        P1495: { numericId: 6534265 },  // community MathModDB (Q6534265)
        P1460: { numericId: 6534272 }   // MaRDI task profile (Q6534272)
      }
    });
  }

  /**
   * Creates a new Mathematical Expression item
   * Includes extra prompt for "defining formula" (property P989)
   */
  function createMathematicalExpression() {
    createItem({
      labelPrompt: 'Enter new mathematical expression label (English, should not be empty):',
      descPrompt: 'Enter new mathematical expression description (English, may be empty):',
      // Extra field for the defining formula - optional property for this item type
      extraPrompt: { key: 'P989', prompt: 'Enter the defining formula (LaTeX without $..$, may be empty):' },
      claims: {
        P31: { numericId: 6481152  }, // instance of mathematical expression (Q6481152)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 5981696 } // MaRDI mathematical expression profile (Q5981696)
      }
    });
  }

  /**
   * Creates a new Quantity item
   */
  function createQuantity() {
    createItem({
      labelPrompt: 'Enter new quantity label (English, should not be empty):',
      descPrompt: 'Enter new quantity description (English, may be empty):',
      claims: {
        P31: { numericId: 6534237 }, // instance of quantity (Q6534237)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534271 } // MaRDI quantity profile (Q6534271)
      }
    });
  }

  /**
   * Creates a new Quantity Kind item
   */
  function createQuantityKind() {
    createItem({
      labelPrompt: 'Enter new quantity kind label (English, should not be empty):',
      descPrompt: 'Enter new quantity kind description (English, may be empty):',
      claims: {
        P31: { numericId: 6534245 }, // instance of quantity kind (Q6534245)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534271 } // MaRDI quantity profile (Q6534271)
      }
    });
  }

  // ==================================================
  // DUPLICATE DETECTION: Prevent creating items with identical label AND description
  // ==================================================
  /**
   * Checks if items with the same label and description already exist
   * Only reports as duplicate if BOTH label and description match
   * 
   * @param {string} label - The label to check
   * @param {string} description - The description to check
   * @param {Object} opts - Options object:
   *   - verbose: {boolean} Show alerts with details if duplicate found
   *   - strictLang: {string} Only check this language (e.g., 'en')
   * 
   * @returns {Object} Result object:
   *   - exists: {boolean} Whether a true duplicate (label + description) was found
   *   - matchType: 'both' or 'label' - what matched
   *   - match: {Object} Matched item info {id, label, description?, lang}
   *   - error: {Error} Error object if API call failed
   */
  async function checkDuplicateLabelAndDescription(label, description, opts) {
    opts = opts || {};
    var verbose = !!opts.verbose;
    var strictLang = opts.strictLang || (MARDI_DUPLICATE_CHECK_STRICT_EN ? 'en' : null);
    if (!label) return { exists: false };
    var api = new mw.Api();

    try {
      var res = await api.get({
        action: 'wbsearchentities',
        search: label,
        language: 'en',
        type: 'item',
        limit: 20,
        format: 'json'
      });
      if (!res || !res.search || res.search.length === 0) return { exists: false };

      // Fetch full entities to inspect labels/descriptions in all languages
      var ids = res.search.map(function(s){ return s.id; }).join('|');
      var ents = await api.get({
        action: 'wbgetentities',
        ids: ids,
        props: 'labels|aliases|descriptions',
        format: 'json'
      });

      var lowerLabel = label.toLowerCase();
      var lowerDesc = description ? description.toLowerCase() : '';
      var exactLabelMatch = null;
      var exactBothMatch = null;

      for (var eid in ents.entities) {
        var ent = ents.entities[eid];
        if (!ent) continue;
        var foundLabelMatch = false;
        var foundDescMatch = false;
        var matchLang = null;

        // Check labels
        if (ent.labels) {
          for (var lang in ent.labels) {
            var lab = ent.labels[lang].value;
            if (!lab) continue;
            var labLower = lab.toLowerCase();
            if (labLower === lowerLabel && (!strictLang || lang === strictLang)) {
              foundLabelMatch = true;
              matchLang = lang;
              if (!exactLabelMatch) {
                exactLabelMatch = { id: ent.id, label: lab, lang: lang };
              }
              break;
            }
          }
        }

        // If we found a label match, check descriptions
        if (foundLabelMatch) {
          if (lowerDesc) {
            // User provided a description, check for exact match
            if (ent.descriptions) {
              for (var dlang in ent.descriptions) {
                var desc = ent.descriptions[dlang].value;
                if (!desc) continue;
                var descLower = desc.toLowerCase();
                if (descLower === lowerDesc && (!strictLang || dlang === strictLang)) {
                  foundDescMatch = true;
                  exactBothMatch = { 
                    id: ent.id, 
                    label: exactLabelMatch.label, 
                    description: desc,
                    lang: matchLang || dlang
                  };
                  break;
                }
              }
            }
          } else {
            // User did NOT provide description, check if existing item also has no description
            var hasExistingDesc = false;
            if (ent.descriptions) {
              for (var dlang in ent.descriptions) {
                var desc = ent.descriptions[dlang].value;
                if (desc && desc.trim()) {
                  hasExistingDesc = true;
                  break;
                }
              }
            }
            if (!hasExistingDesc) {
              // Both have no/empty description, so they match on both label and description
              foundDescMatch = true;
              exactBothMatch = { 
                id: ent.id, 
                label: exactLabelMatch.label, 
                description: '(empty)',
                lang: matchLang
              };
            }
          }
        }

        if (exactBothMatch) break;
      }

      // Check for both label and description match first
      if (exactBothMatch) {
        return { exists: true, matchType: 'both', match: exactBothMatch };
      }

      // Check for label-only match (report but don't block)
      if (exactLabelMatch) {
        if (verbose) {
          var msgL = 'An item with the same label already exists:\n';
          msgL += '"' + exactLabelMatch.label + '"\n';
          msgL += '(Item: ' + exactLabelMatch.id + ')';
          alert(msgL);
        }
        return { exists: true, matchType: 'label', match: exactLabelMatch };
      }

      // No duplicate found
      return { exists: false };
    } catch (e) {
      console.error('Duplicate check failed:', e);
      return { exists: false, error: e };
    }
  }

  // Helper to display visual warning for exact duplicates (label + description)
  function showDuplicateOverlay(url) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '100000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    var box = document.createElement('div');
    box.style.backgroundColor = '#fff';
    box.style.padding = '20px';
    box.style.borderRadius = '5px';
    box.style.maxWidth = '90%';
    box.style.textAlign = 'center';

    var p = document.createElement('p');
    p.innerHTML = '<strong>ERROR:</strong> An item with the same label and description already exists.';
    box.appendChild(p);

    var link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    link.target = '_blank';
    link.style.wordBreak = 'break-all';
    box.appendChild(link);

    box.appendChild(document.createElement('br'));
    var btn = document.createElement('button');
    btn.textContent = 'Close';
    btn.style.marginTop = '10px';
    btn.onclick = function() { document.body.removeChild(overlay); };
    box.appendChild(btn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // ==================================================
  // ITEM CREATION: Main function to create any item type
  // ==================================================
  /**
   * Generic item creation function used by all item type creators
   * Handles user input collection, duplicate checking, and API communication
   * 
   * @param {Object} opts - Configuration object:
   *   - labelPrompt: {string} Prompt text asking for item label
   *   - descPrompt: {string} Prompt text asking for item description
   *   - claims: {Object} Properties and values to add to the item (P31, P1495, P1460, etc.)
   *   - extraPrompt: {Object} Optional - Additional property:
   *       - key: Property identifier (e.g., 'P29')
   *       - prompt: Question to ask user for this property value
   */
  async function createItem(opts) {
    // bail out early if no authenticated user (prevents prompts from appearing)
    if (!userIsLoggedIn()) {
      alert('Error: You have to be logged in to create items.');
      return;
    }

    var api = new mw.Api();
    var label;
    
    // PHASE 1: Collect label from user - loop until valid label provided
    while (true) {
      label = prompt('We appreciate it if you create a label and a description for all of your new items. Every new item should have at least a label.\n\n' + opts.labelPrompt);
      if (label === null) return;  // Cancel button pressed - exit creation process
      label = label.trim();
      if (label) break;  // Valid label provided, exit loop
      alert('Label is required to create an item. Please try again.');
    }

    // PHASE 1b: Collect aliases (pipe-separated)
    var aliasInput = prompt('Enter aliases (pipe-separated, English, may be empty):');
    if (aliasInput === null) return; // user pressed cancel - abort creation
    var aliases = [];
    if (aliasInput && aliasInput.trim()) {
      aliases = aliasInput.split('|').map(function(a){ return a.trim(); }).filter(function(a){ return a; });
    }

    // PHASE 2: Collect description and optional extra field
    var description = prompt(opts.descPrompt);
    if (description === null) return; // user pressed cancel - abort creation
    var extraValue;
    if (opts.extraPrompt) {
      extraValue = prompt(opts.extraPrompt.prompt);
      if (extraValue === null) return; // user pressed cancel - abort creation
    }

    // PHASE 2b: Ensure at least one of label/description/aliases present
    if ((!label || label.trim()==='') && (!description || !description.trim()) && aliases.length === 0) {
      alert('You need to fill at least either label, description or aliases.');
      return;
    }

    // PHASE 3: Check for duplicates with same label AND description
    if (label && label.trim()) {
      try {
        var dup = await checkDuplicateLabelAndDescription(label, description, { 
          verbose: MARDI_DUPLICATE_CHECK_VERBOSE, 
          strictLang: (MARDI_DUPLICATE_CHECK_STRICT_EN ? 'en' : null)
        });
        if (dup && dup.exists && dup.matchType === 'both') {
          var url = 'https://portal.mardi4nfdi.de/wiki/Item:' + dup.match.id;
          showDuplicateOverlay(url);
          return;
        }
      } catch (e) {
        console.warn('Error during duplicate check:', e);
      }
    }

    // PHASE 4: Final confirmation before creating item
    if (!confirm('Create item "' + label + '"?')) return;

    // PHASE 5: Build the item data structure for the API
    try {
      // Initialize data structure with label and empty descriptions/claims
      var data = { 
        labels: { en: { language: 'en', value: label } },  // Main label in English
        descriptions: {},  // Will be populated if description provided
        claims: {}  // Will be populated with property claims
      };
      // add aliases if any were provided
      if (aliases && aliases.length) {
        data.aliases = { en: [] };
        aliases.forEach(function(a) {
          data.aliases.en.push({ language: 'en', value: a });
        });
      }

      // Add property claims from configuration (e.g., instance of, community, profile)
      for (var prop in opts.claims) {
        data.claims[prop] = [{
          type: 'statement',
          rank: 'normal',
          mainsnak: {
            snaktype: 'value',
            property: prop,
            // Claim value points to another item (identified by numeric ID)
            datavalue: { 
              type: 'wikibase-entityid', 
              value: { 
                'entity-type':'item', 
                'numeric-id': opts.claims[prop].numericId 
              } 
            }
          }
        }];
      }

      // Add description if user provided one
      if (description && description.trim()) {
        data.descriptions.en = { language: 'en', value: description.trim() };
      }

      // Add extra property if configured (e.g., mathematical formula for expressions)
      if (opts.extraPrompt && extraValue && extraValue.trim()) {
        data.claims[opts.extraPrompt.key] = [{
          type: 'statement',
          rank: 'normal',
          mainsnak: { 
            snaktype:'value', 
            property: opts.extraPrompt.key, 
            datavalue:{ 
              type:'string',  // Extra property is usually plain text/formula
              value: extraValue.trim() 
            } 
          }
        }];
      }

      // PHASE 6: Send item creation request to API
      var result = await api.postWithToken('csrf', {
        action: 'wbeditentity',  // Wikibase API action
        new: 'item',  // Create new item (not edit existing)
        summary: 'Create MaRDI item via sidebar dropdown',  // Edit summary for history
        data: JSON.stringify(data)  // Item data as JSON string
      });

      // PHASE 7: Handle successful creation
      if (result && result.entity && result.entity.id) {
        // Item created successfully - wait briefly so creation finalizes, then navigate
        console.log('Item created: ' + result.entity.id + ' — redirecting in 4s');
        setTimeout(function() {
          window.location.href = '/wiki/Item:' + result.entity.id;
        }, 4000); // 4000 ms delay to allow backend processes to complete
        return;
      }

      // Unexpected response format
      console.error('Unexpected API response:', result);
      alert('Item was not created. Unexpected API response.');
    } catch (e) {
      // Handle errors from API call
      console.error('API error:', e);
      alert('Item creation failed:\n\n' + (e && e.error && e.error.info ? e.error.info : 'Unknown error'));
    }
  }
})();  // End of IIFE - script executes immediately when page loads
