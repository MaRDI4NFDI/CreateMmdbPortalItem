**Abstract** 

Repository for a navigation menu to create items in Wikibase with predefined entries, i.e. a predefined "community" or "instance of" something. 
This particular navigation menu is for creating MaRDI [https://portal.mardi4nfdi.de/wiki/MathModDB MathModDB] items (all types) in the MaRDI Portal with predefined values and and duplicate label check.


Here are the specific presets for MathModDB Items: 
| Type                    | instance of | MaRDI profile type |
| ----------------------- | ----------- | ------------------ |
| Academic discipline     | Q60231      | Q6534268           |
| Mathematical expression | Q6481152    | Q5981696           |
| Mathematical model      | Q68663      | Q6534270           |
| Quantity                | Q6534237    | Q6534271           |
| Kind of Quantity        | Q6534245    | Q6534271           |
| Research problem        | Q6534292    | Q6534269           |
| Computational task      | Q6534247    | Q6534272           |

**Usage**

Just put the contents of 'createPreDefMenu_common.js' into your MediaWiki:Common.js of the Wikibase instance


**Authors**

Björn Schembera / bjoern.schembera@mathematik.uni-stuttgart.de

Aurela Shehu / shehu@wias-berlin.de
