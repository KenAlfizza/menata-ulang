Why is this?
    
/(explore) - This is the main explore page
- The layout in this folder allows for the navigation and background to work without remount for the explore page
- The page in this folder will mount the featured and feed component based on page in /explore/[page]

/[page]/[slug] - This is the explore slug page
- The layout is strictly for the slug pages, separation from the main explore page layout
- Change the layout depending on the page and fetch data based on slug

The layout in explore folder is to allow shared layout between all of the subfolders
