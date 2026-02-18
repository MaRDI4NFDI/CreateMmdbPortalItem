/* 

Navigation menu for creating MaRDI items (all types) in the MaRDI Portal 
with predefined values and and duplicate label check.

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

  // UI SETUP: Wait for the sidebar to load, then inject the dropdown menu
  // Use setInterval to poll for nav-items since they may not be immediately available
  var sidebarInterval = setInterval(function() {
    var navItems = document.getElementsByClassName('nav-item');
    if (!navItems || navItems.length === 0) return;  // Sidebar not ready yet, try again
    
    var sidebarContainer = navItems[0].parentNode;
    if (!sidebarContainer) return;  // Parent container not found, try again

    clearInterval(sidebarInterval);  // Stop polling once sidebar is found

    // DROPDOWN STRUCTURE: Create the main container and trigger link
    // Main dropdown container - positioned relative so submenu can be absolutely positioned
    var container = document.createElement('div');
    container.id = linkId;
    container.className = 'nav-item mw-list-item';
    container.style.position = 'relative'; // needed for dropdown positioning

    // Main link/trigger - clicking this toggles submenu visibility
    var mainLink = document.createElement('span');
    mainLink.className = 'nav-link';
    mainLink.style.cursor = 'pointer';
    mainLink.appendChild(document.createTextNode('Create MathModDB Item'));
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
    betaNote.innerHTML = 'This is a beta version. Be careful and <a href="https://github.com/MaRDI4NFDI/MaRDIRoadmap/issues/105" target="_blank" rel="noopener noreferrer">report bugs to us</a>.';
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
      (function(fn){ link.onclick = fn; })(items[i].fn);
      submenu.appendChild(link);
    }

    // Attach submenu to main container and add to sidebar
    container.appendChild(submenu);
    sidebarContainer.appendChild(container);

    // EVENT HANDLERS: Toggle and close submenu
    // Click on main link toggles submenu visibility
    mainLink.onclick = function() {
      submenu.style.display = (submenu.style.display === 'none') ? 'flex' : 'none';
    };

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
      labelPrompt: 'Enter new academic discipline label (English):',
      descPrompt: 'Enter new academic discipline description (English, should not be empty):',
      claims: {
        P31: { numericId: 60231 }, // instance of academic discipline (Q60231)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534268 } // MaRDI academic discipline profile (Q6534268)
      }
    });
  }

  /**
   * Creates a new Mathematical Expression item
   * Includes extra prompt for "defining formula" (property P989)
   */
  function createMathematicalExpression() {
    createItem({
      labelPrompt: 'Enter new mathematical expression label (English):',
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
   * Creates a new Mathematical Model item
   */
  function createMathematicalModel() {
    createItem({
      labelPrompt: 'Enter new mathematical model label (English):',
      descPrompt: 'Enter new mathematical model description (English, should not be empty):',
      claims: {
        P31: { numericId: 68663 }, // instance of mathematical model (Q68663)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534270 } // MaRDI mathematical model profile (Q6534270)
      }
    });
  }

  /**
   * Creates a new Quantity item
   */
  function createQuantity() {
    createItem({
      labelPrompt: 'Enter new quantity label (English):',
      descPrompt: 'Enter new quantity description (English, should not be empty):',
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
      labelPrompt: 'Enter new quantity kind label (English):',
      descPrompt: 'Enter new quantity kind description (English, should not be empty):',
      claims: {
        P31: { numericId: 6534245 }, // instance of quantity kind (Q6534245)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534271 } // MaRDI quantity profile (Q6534271)
      }
    });
  }

  /**
   * Creates a new Research Problem item
   */
  function createResearchProblem() {
    createItem({
      labelPrompt: 'Enter new research problem label (English):',
      descPrompt: 'Enter new research problem description (English, should not be empty):',
      claims: {
        P31: { numericId: 6534292 }, // instance of research problem (Q6534292)
        P1495: { numericId: 6534265 }, // community MathModDB (Q6534265)
        P1460: { numericId: 6534269 }  // MaRDI research problem profile (Q6534269)
      }
    });
  }
  
  /**
   * Creates a new Computational Task item
   */
  function createComputationalTask() {
    createItem({
      labelPrompt: 'Enter new computational task label (English):',
      descPrompt: 'Enter new computational task description (English, should not be empty):',
      claims: {
        P31:   { numericId: 6534247 },  // instance of computational task (Q6534247)
        P1495: { numericId: 6534265 },  // community MathModDB (Q6534265)
        P1460: { numericId: 6534272 }   // MaRDI task profile (Q6534272)
      }
    });
  }

  // ==================================================
  // DUPLICATE DETECTION: Prevent creating items with existing labels
  // ==================================================
  /**
   * Checks if a label already exists in the database
   * Searches across all languages and aliases for potential duplicates
   * 
   * @param {string} label - The label to check
   * @param {Object} opts - Options object:
   *   - verbose: {boolean} Show alerts with details if duplicate found
   *   - strictLang: {string} Only check this language (e.g., 'en')
   *   - requireExact: {boolean} True = only report exact matches, False = include partial matches
   * 
   * @returns {Object} Result object:
   *   - exists: {boolean} Whether a potential duplicate was found
   *   - exact: {boolean} Whether it's an exact match or fuzzy match
   *   - match: {Object} First matched item info {id, label, lang, alias?}
   *   - all: {Array} All fuzzy matches if any
   *   - error: {Error} Error object if API call failed
   */
  async function checkDuplicateLabel(label, opts) {
    // Parse options with defaults
    opts = opts || {};
    var verbose = !!opts.verbose;  // Show alerts for duplicates
    var strictLang = opts.strictLang || (MARDI_DUPLICATE_CHECK_STRICT_EN ? 'en' : null);  // Language filter
    var requireExact = (opts.requireExact !== undefined) ? !!opts.requireExact : true;  // Exact vs fuzzy match
    
    // Handle empty label
    if (!label) return { exists: false };
    
    var api = new mw.Api();
    try {
      // STEP 1: Perform initial search using the Wikibase search API
      var res = await api.get({
        action: 'wbsearchentities',
        search: label,
        language: 'en',
        type: 'item',
        limit: 20,  // Get up to 20 results
        format: 'json'
      });
      
      // Return if no results found
      if (!res || !res.search || res.search.length === 0) return { exists: false };

      // STEP 2: Fetch full entity data to check labels and aliases in all languages
      var ids = res.search.map(function(s){ return s.id; }).join('|');
      var ents = await api.get({
        action: 'wbgetentities',
        ids: ids,
        props: 'labels|aliases',  // Get both labels and alternative names
        format: 'json'
      });

      // STEP 3: Compare search results with input label (case-insensitive)
      var lower = label.toLowerCase();  // Normalize for comparison
      var exactMatch = null;
      var fuzzyMatches = [];  // Store partial/substring matches

      // Iterate through all entities returned from search
      for (var eid in ents.entities) {
        var ent = ents.entities[eid];
        if (!ent) continue;
        
        // Check official labels in all languages
        if (ent.labels) {
          for (var lang in ent.labels) {
            var lab = ent.labels[lang].value;
            if (!lab) continue;
            var labLower = lab.toLowerCase();
            
            // Exact match: label matches exactly (and language matches if strictLang is set)
            if (labLower === lower && (!strictLang || lang === strictLang)) {
              exactMatch = { id: ent.id, label: lab, lang: lang };
              break;
            } 
            // Fuzzy match: label contains the search term
            else if ((!strictLang || lang === strictLang) && labLower.indexOf(lower) !== -1) {
              fuzzyMatches.push({ id: ent.id, label: lab, lang: lang });
            }
          }
        }
        if (exactMatch) break;  // Stop searching if exact match found
        
        // Check aliases (alternative names/synonyms) in all languages
        if (ent.aliases) {
          for (var lang2 in ent.aliases) {
            var alist = ent.aliases[lang2];
            for (var j = 0; j < alist.length; j++) {
              var al = alist[j].value;
              if (!al) continue;
              var alLower = al.toLowerCase();
              
              // Exact match in aliases
              if (alLower === lower && (!strictLang || lang2 === strictLang)) {
                exactMatch = { id: ent.id, label: al, lang: lang2, alias: true };
                break;
              }
              // Fuzzy match in aliases
              else if ((!strictLang || lang2 === strictLang) && alLower.indexOf(lower) !== -1) {
                fuzzyMatches.push({ id: ent.id, label: al, lang: lang2, alias: true });
              }
            }
            if (exactMatch) break;  // Stop if exact match found
          }
        }
        if (exactMatch) break;  // Stop iterating entities if exact match found
      }

      // STEP 4: Return results based on matches found
      if (exactMatch) {
        // Exact match found - label already exists
        if (verbose) alert('Exact match found: ' + exactMatch.label + ' (Item:' + exactMatch.id + ', lang=' + exactMatch.lang + ')');
        console.log('checkDuplicateLabel: exact match', exactMatch);
        return { exists: true, exact: true, match: exactMatch };
      }

      // If not requiring exact match and fuzzy matches exist, report them
      if (!requireExact && fuzzyMatches.length) {
        if (verbose) {
          var msg2 = 'Ähnliche Items gefunden:\n';
          for (var k2 = 0; k2 < fuzzyMatches.length; k2++) {
            msg2 += fuzzyMatches[k2].label + ' (Item:' + fuzzyMatches[k2].id + ', lang=' + fuzzyMatches[k2].lang + ')\n';
          }
          alert(msg2);
        }
        console.log('checkDuplicateLabel: fuzzy matches', fuzzyMatches);
        return { exists: true, exact: false, match: fuzzyMatches[0], all: fuzzyMatches };
      }

      // No duplicate found according to specified criteria
      console.log('checkDuplicateLabel: no duplicate found (strictLang=' + strictLang + ', requireExact=' + requireExact + ')');
      return { exists: false };
    } catch (e) {
      // API error occurred - log it but allow item creation to proceed
      console.error('Label check failed:', e);
      return { exists: false, error: e };
    }
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
    var api = new mw.Api();
    var label;
    
    // PHASE 1: Collect label from user (keep asking until non-empty)
    do {
      label = prompt(opts.labelPrompt);
      if (label === null) return;  // User cancelled
      label = label.trim();
    } while (!label);  // Loop until user provides non-empty label

    // PHASE 2: Check for duplicate labels to prevent accidental duplicates
    try {
      var dup = await checkDuplicateLabel(label, { 
        verbose: MARDI_DUPLICATE_CHECK_VERBOSE, 
        strictLang: (MARDI_DUPLICATE_CHECK_STRICT_EN ? 'en' : null), 
        requireExact: true 
      });
      
      if (dup && dup.exists) {
        // Duplicate found - warn user but allow override
        var msg = 'An item with the label "' + label + '" appears to already exist.';
        if (dup.exact && dup.match && dup.match.id) msg += ' (Exact match: Item:' + dup.match.id + ')';
        else if (dup.match && dup.match.id) msg += ' (Similar match: Item:' + dup.match.id + ')';
        // If verbose mode, user already saw detailed alerts about the duplicate
        msg += '\n\nCreate anyway?';
        if (!confirm(msg)) return;  // User chose not to create duplicate
      }
    } catch (e) {
      console.warn('Error during duplicate check:', e);
      // Continue despite error - don't block item creation
    }

    // PHASE 3: Collect description and optional extra field
    var description = prompt(opts.descPrompt);
    var extraValue;
    if (opts.extraPrompt) {
      extraValue = prompt(opts.extraPrompt.prompt);
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
        console.log('Item created: ' + result.entity.id + ' — redirecting in 3.5s');
        setTimeout(function() {
          window.location.href = '/wiki/Item:' + result.entity.id;
        }, 3500); // 3500 ms delay to allow backend processes to complete
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