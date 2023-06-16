"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAll = void 0;
const listAll = async (callback, getter) => {
    let nextToken = undefined;
    let ans = [];
    do {
        const response0 = await callback(nextToken);
        const response = getter(response0);
        if (response.Items) {
            ans.push(...response.Items);
        }
        nextToken = response.NextToken;
    } while (nextToken != null);
    return ans;
};
exports.listAll = listAll;
//# sourceMappingURL=listAll.js.map