**Usefull:**
Deleting GIT history: 
[link](https://medium.com/@mgm06bm/ultimate-guide-on-how-to-delete-commit-history-in-github-35cc11d74571)

- To log the last commits `git log -10`
- To remove the last commit from git, you can simply run `git reset --hard HEAD^` 
- If you are removing multiple commits from the top, you can run `git reset --hard HEAD~2` to remove the last two commits. 
  - You can increase the number to remove even more commits.

- to force the change `git push origin +main`