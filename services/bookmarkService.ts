import { BookmarkNode, BookmarkFolder, BookmarkLink, isFolder } from '../types';
import { generateId } from '../utils';

export const parseNetscapeBookmarks = (htmlContent: string): BookmarkFolder[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const rootList = doc.querySelector('dl');
  if (!rootList) return [];

  const traverse = (dl: Element): BookmarkNode[] => {
    const nodes: BookmarkNode[] = [];
    const children = Array.from(dl.children);

    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      if (item.tagName === 'DT') {
        // Check for Folder (H3)
        const h3 = item.querySelector('h3');
        if (h3) {
          const nextSibling = item.nextElementSibling;
          let childNodes: BookmarkNode[] = [];
          // Check if DL is directly next to DT (common structure)
          if (nextSibling && nextSibling.tagName === 'DL') {
            childNodes = traverse(nextSibling);
          } else if (nextSibling && nextSibling.tagName === 'DD') {
            // DL might be inside the next DD
            const innerDl = nextSibling.querySelector('dl');
            if (innerDl) {
              childNodes = traverse(innerDl);
            }
          } else if (item.querySelector('dl')) {
             // Sometimes DL is nested inside DT
             const innerDl = item.querySelector('dl');
             if(innerDl) childNodes = traverse(innerDl);
          }

          nodes.push({
            id: generateId(),
            title: h3.textContent || '新建文件夹',
            children: childNodes,
            addDate: h3.getAttribute('add_date') || undefined,
            lastModified: h3.getAttribute('last_modified') || undefined,
          });
        } 
        // Check for Link (A)
        else {
          const a = item.querySelector('a');
          if (a) {
            nodes.push({
              id: generateId(),
              title: a.textContent || '未命名',
              url: a.href,
              addDate: a.getAttribute('add_date') || undefined,
              icon: a.getAttribute('icon') || undefined,
            });
          }
        }
      }
    }
    return nodes;
  };

  const result = traverse(rootList);
  
  const folders: BookmarkFolder[] = [];
  const looseLinks: BookmarkLink[] = [];

  result.forEach(node => {
    if (isFolder(node)) {
      folders.push(node);
    } else {
      looseLinks.push(node);
    }
  });

  if (looseLinks.length > 0) {
    folders.unshift({
      id: generateId(),
      title: '未分类',
      children: looseLinks
    });
  }

  return folders;
};

export const generateNetscapeBookmarks = (folders: BookmarkFolder[]): string => {
  const now = Math.floor(Date.now() / 1000);
  
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  const indent = (level: number) => '    '.repeat(level);

  const traverse = (nodes: BookmarkNode[], level: number): string => {
    let output = '';
    nodes.forEach(node => {
      if (isFolder(node)) {
        output += `${indent(level)}<DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">${node.title}</H3>\n`;
        output += `${indent(level)}<DL><p>\n`;
        output += traverse(node.children, level + 1);
        output += `${indent(level)}</DL><p>\n`;
      } else {
        output += `${indent(level)}<DT><A HREF="${node.url}" ADD_DATE="${now}">${node.title}</A>\n`;
      }
    });
    return output;
  };

  html += traverse(folders, 1);
  html += `</DL><p>`;
  
  return html;
};