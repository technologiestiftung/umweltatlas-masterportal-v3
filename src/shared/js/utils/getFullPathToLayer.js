/**
 * gets the file path to a specific folder name
 * @folderTree {object} folder tree
 * @targetId {string} layer id
 * @returns {Array} an array with objects containing folder id and name 
 */
export function getFullPathToLayer(folderTree, targetId, currentPath = []) {

    if(!folderTree || !targetId) return null

    // Handle arrays
    if (Array.isArray(folderTree)) {
        for (let i = 0; i < folderTree.length; i++) {
            const result = getFullPathToLayer(folderTree[i], targetId, currentPath);
            if (result) {
                return result; // Return the path when found
            }
        }
        return null; // If the targetId is not found in any array elements
    }

    // Handle objects
    const newPath = [...currentPath, {id:folderTree.id,name:folderTree.name}]; // Append the current object's name to the path
    
    // If the object has the target id, return the path as an array
    if (folderTree.id === targetId) {
        return newPath;
    }

    // Check if the folderTree has elements instead of children
    if (folderTree.elements && Array.isArray(folderTree.elements)) {
        return getFullPathToLayer(folderTree.elements, targetId, newPath);
    }

    return null; // Return null if target id is not found
}