const { assert, sinon } = require('../test');

describe('Fetch recent file', () => {
    let github;
    let lib;
    let commits;
    let pullRequest = require('../test/fixtures/pull-request.json');

    beforeEach(() => {
        commits = [
            { sha: 'a444', parents: [{ sha: 'a333' }] },
            { sha: 'a222', parents: [{ sha: 'a111' }] },
            { sha: 'a333', parents: [{ sha: 'a222' }] },
            { sha: 'a111', parents: [{ sha: 'fork-point-sha' }] }
        ];

        github = {
            getRepoContent: sinon.stub(),
            getCommitsFromPr: sinon.stub().resolves(commits)
        };

        lib = require('./factory')(github);

        pullRequest = Object.assign({}, pullRequest);
    });

    describe('.getForkPointCommitSha', () => {
        it('should return source commit sha', () => {
            const actual = lib.getForkPointCommitSha(commits);

            assert.equal(actual, 'fork-point-sha');
        });

        it('should throw error if commit has more than one parents', () => {
            const commit = {
                sha: 'a555',
                parents: [
                    { sha: 'a666' },
                    { sha: 'a777' }
                ]
            };

            const actual = () => lib.getForkPointCommitSha([commit]);

            assert.throws(actual, 'commit a555 has more than one parents');
        });

        it('should throw error if not found source commit sha', () => {
            const formatCommits = '[ commit: a444 parent: a222 ] [ commit: a222 parent: a444 ]';

            const actual = () => lib.getForkPointCommitSha([
                { sha: 'a444', parents: [{ sha: 'a222' }] },
                { sha: 'a222', parents: [{ sha: 'a444' }] }
            ]);

            assert.throws(actual, `not found fork-point commit sha  ${formatCommits}`);
        });
    });

    describe('.getRecentFile', () => {
        it('should get head file from fork', async () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).resolves({ sha: 123, content: '123' });

            await lib.getRecentFile(pullRequest, 'test');

            const getRepoContentArgs = github.getRepoContent.args;

            assert.equal(getRepoContentArgs[0][0], 'octocat-fork');
            assert.equal(getRepoContentArgs[1][0], 'octocat');
        });

        it('should throw error if file does not exists in head or base', () => {
            github.getRepoContent.onCall(0).rejects(new Error('404'));
            github.getRepoContent.onCall(1).rejects(new Error('404'));

            const promise = lib.getRecentFile(pullRequest, 'test');

            return assert.isRejected(promise, 'could not fetch file from head and base branches');
        });

        it('should return from base branch if file does not exists in head', async () => {
            github.getRepoContent.onCall(0).rejects(new Error('404'));
            github.getRepoContent.onCall(1).resolves({ sha: 123, content: '123' });

            const actual = await lib.getRecentFile(pullRequest, 'test');

            assert.calledTwice(github.getRepoContent);
            assert.equal(actual, '123');
        });

        it('should return from head branch if file does not exists in base', async () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).rejects(new Error('404'));

            const actual = await lib.getRecentFile(pullRequest, 'test');

            assert.calledTwice(github.getRepoContent);
            assert.equal(actual, '123');
        });

        it('should return file from base branch if head file equal to base file', async () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).resolves({ sha: 123, content: '123' });

            const actual = await lib.getRecentFile(pullRequest, 'test');

            assert.calledTwice(github.getRepoContent);
            assert.equal(actual, '123');
        });

        it('should return file from base branch if file changed only in base branch', async () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).resolves({ sha: 456, content: '456' });
            github.getRepoContent.onCall(2).resolves({ sha: 123, content: '123' });

            const actual = await lib.getRecentFile(pullRequest, 'test');

            assert.calledThrice(github.getRepoContent);
            assert.equal(actual, '456');
        });

        it('should return file from head branch if file changed only in head branch', async () => {
            github.getRepoContent.onCall(0).resolves({ sha: 456, content: '456' });
            github.getRepoContent.onCall(1).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(2).resolves({ sha: 123, content: '123' });

            const actual = await lib.getRecentFile(pullRequest, 'test');

            assert.calledThrice(github.getRepoContent);
            assert.equal(actual, '456');
        });

        it('should calls all function with valid arguments', async () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).resolves({ sha: 456, content: '456' });
            github.getRepoContent.onCall(2).resolves({ sha: 456, content: '456' });

            await lib.getRecentFile(pullRequest, 'test');

            const getContentArgs = github.getRepoContent.args;
            const getCommitsFromPrArgs = github.getCommitsFromPr.args;

            assert.deepEqual(getCommitsFromPrArgs[0], ['octocat', 'Hello-World', 1347]);
            assert.deepEqual(getContentArgs[0], ['octocat-fork', 'Hello-World', 'test', '6dcb09b5b57875']);
            assert.deepEqual(getContentArgs[1], ['octocat', 'Hello-World', 'test', 'master']);
            assert.deepEqual(getContentArgs[2], ['octocat', 'Hello-World', 'test', 'fork-point-sha']);
        });

        it('should throw error if all files is not equal', () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).resolves({ sha: 456, content: '456' });
            github.getRepoContent.onCall(2).resolves({ sha: 789, content: '789' });

            const promise = lib.getRecentFile(pullRequest, 'test');

            return assert.isRejected(promise, 'file "test" has changes in head and base branches');
        });

        it('should throw error if file does not exist in fork-point commit', () => {
            github.getRepoContent.onCall(0).resolves({ sha: 123, content: '123' });
            github.getRepoContent.onCall(1).resolves({ sha: 456, content: '456' });
            github.getRepoContent.onCall(2).rejects(new Error('404'));

            const promise = lib.getRecentFile(pullRequest, 'test');

            return assert.isRejected(promise, 'could not fetch file from fork-point commit fork-point-sha');
        });
    });
});
