"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UNRELEASED_TAG = "___unreleased___";
const COMMIT_FIX_REGEX = /(fix|close|resolve)(e?s|e?d)? [T#](\d+)/i;
class MarkdownRenderer {
    constructor(options) {
        this.options = options;
    }
    renderMarkdown(releases) {
        let output = releases
            .map(release => this.renderRelease(release))
            .filter(Boolean)
            .join("\n\n\n");
        return output ? `\n${output}` : "";
    }
    renderRelease(release) {
        const categories = this.groupByCategory(release.commits);
        const categoriesWithCommits = categories.filter(category => category.commits.length > 0);
        if (categoriesWithCommits.length === 0)
            return "";
        const releaseTitle = release.name === UNRELEASED_TAG ? this.options.unreleasedName : release.name;
        let markdown = `## ${releaseTitle} (${release.date})`;
        for (const category of categoriesWithCommits) {
            markdown += `\n\n#### ${category.name}\n`;
            if (this.hasPackages(category.commits)) {
                markdown += this.renderContributionsByPackage(category.commits);
            }
            else {
                markdown += this.renderContributionList(category.commits);
            }
        }
        if (release.contributors) {
            markdown += `\n\n${this.renderContributorList(release.contributors)}`;
        }
        return markdown;
    }
    renderContributionsByPackage(commits) {
        const commitsByPackage = {};
        for (const commit of commits) {
            const changedPackages = commit.packages || [];
            const packageName = this.renderPackageNames(changedPackages);
            commitsByPackage[packageName] = commitsByPackage[packageName] || [];
            commitsByPackage[packageName].push(commit);
        }
        const packageNames = Object.keys(commitsByPackage);
        return packageNames
            .map(packageName => {
            const pkgCommits = commitsByPackage[packageName];
            return `* ${packageName}\n${this.renderContributionList(pkgCommits, "  ")}`;
        })
            .join("\n");
    }
    renderPackageNames(packageNames) {
        return packageNames.length > 0 ? packageNames.map(pkg => `\`${pkg}\``).join(", ") : "Other";
    }
    renderContributionList(commits, prefix = "") {
        return commits
            .map(commit => this.renderContribution(commit))
            .filter(Boolean)
            .map(rendered => `${prefix}* ${rendered}`)
            .join("\n");
    }
    renderContribution(commit) {
        const issue = commit.githubIssue;
        if (issue) {
            let markdown = "";
            if (issue.number && issue.pull_request && issue.pull_request.html_url) {
                const prUrl = issue.pull_request.html_url;
                markdown += `[#${issue.number}](${prUrl}) `;
            }
            if (issue.title && issue.title.match(COMMIT_FIX_REGEX)) {
                issue.title = issue.title.replace(COMMIT_FIX_REGEX, `Closes [#$3](${this.options.baseIssueUrl}$3)`);
            }
            markdown += `${issue.title} ([@${issue.user.login}](${issue.user.html_url}))`;
            return markdown;
        }
    }
    renderContributorList(contributors) {
        const renderedContributors = contributors.map(contributor => `- ${this.renderContributor(contributor)}`).sort();
        return `#### Committers: ${contributors.length}\n${renderedContributors.join("\n")}`;
    }
    renderContributor(contributor) {
        const userNameAndLink = `[@${contributor.login}](${contributor.html_url})`;
        if (contributor.name) {
            return `${contributor.name} (${userNameAndLink})`;
        }
        else {
            return userNameAndLink;
        }
    }
    hasPackages(commits) {
        return commits.some(commit => commit.packages !== undefined && commit.packages.length > 0);
    }
    groupByCategory(allCommits) {
        return this.options.categories.map(name => {
            let commits = allCommits.filter(commit => commit.categories && commit.categories.indexOf(name) !== -1);
            return { name, commits };
        });
    }
}
exports.default = MarkdownRenderer;
