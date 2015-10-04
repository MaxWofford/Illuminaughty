# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import requests
import language_check
import pprint
searchDepthThreshold = 10
def wikidataSearch(name):
	result = requests.get('https://www.wikidata.org/w/api.php',params={
	'action':'wbsearchentities',
	'search':name,
	'language':'en',
	'format':'json'
	}).json()['search']
	if result==[]:
		print 'WARNING: No match found.'
	return result
claimsCache = {}
def wikidataGetClaims(entityId):
	if claimsCache.has_key(entityId):
		return claimsCache[entityId]
	else:
		claims = {}
		for propertyId,v in requests.get('https://www.wikidata.org/w/api.php',params={
		'action':'wbgetclaims',
		'entity':entityId,
		'format':'json'
		}).json()['claims'].items():
			itemIds = []
			for va in v:
				mainSnak = va['mainsnak']
				if mainSnak['datatype']=='wikibase-item':
					itemId = 'Q'+str(mainSnak['datavalue']['value']['numeric-id'])
					itemIds.append(itemId)
			if itemIds!=[]:
				claims[propertyId]=itemIds
		claimsCache[entityId] = claims
		return claims
labelCache = {}
def wikidataGetEntityLabel(entityId):
	if labelCache.has_key(entityId):
		return labelCache[entityId]
	else:
		try:
			label = requests.get('https://www.wikidata.org/w/api.php',params={
					'action':'wbgetentities',
					'props':'labels',
					'ids':entityId,
					'languages':'en',
					'format':'json'
					}).json()['entities'][entityId]['labels']['en']['value']
			labelCache[entityId] = label
			return label
		except:
			return entityId
def naturallyDescribeWithClaims(claims):
	result = ''
	for propertyId,itemIds in claims.items():
		result = result + wikidataGetEntityLabel(propertyId)+' '+\
			' and '.join([wikidataGetEntityLabel(itemId) for itemId in itemIds])+'. '
	return result
def expandClaimsForLooping(claimsInDict):
	claimsInList = []
	for propertyId,itemIds in claimsInDict.items():
		for itemId in itemIds:
			claimsInList.append((propertyId,itemId))
depthFromA = 0
depthFromB = 0
currentPathFromA = []
currentPathFromB = []
nodesToCheckFromA = []
nodesWithKnownShortestPaths = {}
def stepForwardFromA():
	possibleSolution = []
	for nodeId in nodesToCheckFromA:
		if nodeId in nodesWithKnownShortestPaths.viewkeys():
			knownPathToThisNode = nodesWithKnownShortestPaths[nodeId]
			if knownPathToThisNode[0][1]==ItemAId:
				#This path is found starting from this side.
				currentPathFromA = 
				if len(currentPathFromA)<len(knownPathToThisNode):
					nodesWithKnownShortestPaths[nodeId] = currentPathFromA
			else:
				#This shortest path is found from the other side!! Yeahhh!
				knownPathToThisNode.reverse()
				newSolution = currentPathFromA+knownPathToThisNode
				if len(possibleSolution)==0 or len(possibleSolution)>newSolution:
					possibleSolution = newSolution
	if possibleSolution==[]:
		return False
	else:
		print possibleSolution
		return True
def findPath(ItemAId='Q7802',ItemBId='Q336'):
	global currentPathFromA, currentPathFromB
	currentPathFromA = [('start',ItemAId)]
	currentPathFromB = [('start',ItemBId)]
	while depthFromA+depthFromB<searchDepthThreshold:
		ifSucceed = stepForwardFromA()
		if ifSucceed:
			break
		ifSucceed = stepForwardFromB()
		if ifSucceed:
			break
if __name__=='__main__':
	#Set up the language checker:
	languageTool = language_check.LanguageTool('en-CA')
	#Test:
	testInputs = ['bread', 'food', 'good', 'service', 'economics', 'social science', 'science']
	targetId = 'Q336' #"science"
	for testInput in testInputs:
		print 'Testing query "'+testInput+'"...'
		testItemId = wikidataSearch(testInput)[0]['id']
		testItemClaims = wikidataGetClaims(testItemId)
		#print testItemClaims
		testItemLabel = wikidataGetEntityLabel(testItemId)
		naturalDescription = testItemLabel+' is '+naturallyDescribeWithClaims(testItemClaims)
		#Fix the language:
		languageCheckerMatches = languageTool.check(naturalDescription)
		naturalDescription = language_check.correct(naturalDescription, languageCheckerMatches)
		print naturalDescription