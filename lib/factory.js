const debugModule = require('debug');

const { NotFoundError, ConflictError, ManyCommitsError } = require('./errors');

const createDebug = (name) => debugModule(`github:get-recent-file:${name}`);

/**
 * @param {object} commits
 * @returns {string}
 */
const formatCommits = (commits) => {
    return commits.reduce((str, commit) => {
        return `${str} [ commit: ${commit.sha} parent: ${commit.parents[0].sha} ]`;
    }, '');
};

/**
 * @param {object} pr
 * @returns {string}
 */
const identifyPr = (pr) => `${pr.base.repo.owner.login}/${pr.base.repo.name}#${pr.number}`;

/**
 * @param {object} file
 * @returns {string}
 */
const decodeContent = (file) => Buffer.from(file.content, file.encoding).toString();

/**
 * Find a commit from the list of commits that the parent does not have in this list.
 *
 * @param {object[]} commits
 * @returns {string}
 * @throws {ConflictError}
 */
const getForkPointCommitSha = (commits) => {
    const shaCollection = new Set(commits.map((commit) => commit.sha));

    for (const commit of commits) {
        if (commit.parents.length > 1) {
            throw new ConflictError(`commit ${commit.sha} has more than one parents`);
        }

        if (!shaCollection.has(commit.parents[0].sha)) {
            return commit.parents[0].sha;
        }
    }

    throw new ConflictError(`not found fork-point commit sha ${formatCommits(commits)}`);
};

module.exports = (github) => {
    /**
     * Search for a recent file, by comparing the hash sum of the file from the base branch and head branch.
     *
     * @param {object} pullRequest
     * @param {string} filePath
     * @returns {Promise<string>}
     * @throws {ConflictError|NotFoundError|ManyCommitsError}
     */
    const getRecentFile = async (pullRequest, filePath) => {
        const prId = identifyPr(pullRequest);

        const debug = createDebug(prId);

        const prNumber = pullRequest.number;
        const numberOfCommits = pullRequest.commits;
        const headRef = pullRequest.head.sha;
        const baseRef = pullRequest.base.ref;
        const headOwner = pullRequest.head.repo.owner.login;
        const baseOwner = pullRequest.base.repo.owner.login;
        const repo = pullRequest.base.repo.name;

        debug(`try to get file "${filePath}" from pull-request`);
        debug(`get files from head-ref "${headRef}" and base-ref "${baseRef}"`);

        const [headFile, baseFile] = await Promise.all([
            github.getRepoContent(headOwner, repo, filePath, headRef).catch(() => null),
            github.getRepoContent(baseOwner, repo, filePath, baseRef).catch(() => null)
        ]);

        if (!headFile && !baseFile) {
            throw new NotFoundError('could not fetch file from head and base branches', filePath);
        }

        if (!headFile) {
            debug('file exists only in base branch → use base');

            return decodeContent(baseFile);
        }

        if (!baseFile) {
            debug('file exists only in head branch → use head');

            return decodeContent(headFile);
        }

        debug(`found files → head: ${headFile.sha} base: ${baseFile.sha}`);

        const isHeadBaseSame = headFile.sha === baseFile.sha;

        if (isHeadBaseSame) {
            debug('head == base → use base');

            return decodeContent(baseFile);
        }

        debug(`found pull-request commits → ${numberOfCommits}`);

        if (numberOfCommits > 250) {
            throw new ManyCommitsError(`pull-request has more than 250 commits: ${numberOfCommits}`);
        }

        const prCommits = await github.getCommitsFromPr(baseOwner, repo, prNumber);

        const forkPointRef = getForkPointCommitSha(prCommits);

        const forkPointFile = await github.getRepoContent(baseOwner, repo, filePath, forkPointRef)
            .catch(() => {
                throw new NotFoundError(`could not fetch file from fork-point commit ${forkPointRef}`, filePath);
            });

        const isBaseForkPointSame = baseFile.sha === forkPointFile.sha;
        const isHeadForkPointSame = headFile.sha === forkPointFile.sha;
        const isOnlyHeadChanged = !isHeadForkPointSame && isBaseForkPointSame;
        const isOnlyBaseChanged = !isBaseForkPointSame && isHeadForkPointSame;

        debug(`found fork-point-ref "${forkPointRef}" and file ${forkPointFile.sha}`);

        if (isOnlyBaseChanged) {
            debug('file changed only in base branch → use base');

            return decodeContent(baseFile);
        }

        if (isOnlyHeadChanged) {
            debug('file changed only in head branch → use head');

            return decodeContent(headFile);
        }

        debug('all files is not equals → pull-request rebase required');

        throw new ConflictError(`file "${filePath}" has changes in head and base branches`);
    };

    return {
        getForkPointCommitSha,
        getRecentFile
    };
};
